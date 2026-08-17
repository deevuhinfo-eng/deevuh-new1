import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { payuConfig, verifyPayuHash } from '@/lib/payu';
import { sendCustomerOrderConfirmation, sendMerchantOrderNotification } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COD_FEE = 149;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const expectedStatus = new URL(request.url).searchParams.get('status') || 'success';

    const txnid = (form.get('txnid') as string) || '';
    const mihpayid = (form.get('mihpayid') as string) || '';
    const payuStatus = (form.get('status') as string) || '';
    const amount = (form.get('amount') as string) || '';
    const email = (form.get('email') as string) || '';
    const firstname = (form.get('firstname') as string) || '';
    const productinfo = (form.get('productinfo') as string) || '';
    const udf1 = (form.get('udf1') as string) || ''; // orderId
    const udf2 = (form.get('udf2') as string) || ''; // paymentMethod
    const hash = (form.get('hash') as string) || '';
    const error = (form.get('error') as string) || '';

    const orderId = udf1;
    const payu = payuConfig();

    // Verify the response hash for EVERY status (success or failure), never skip it
    const expectedHash = verifyPayuHash({
      salt: payu.salt,
      status: payuStatus,
      udf1,
      udf2,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key: payu.key,
    });
    const hashValid = hash === expectedHash;

    // Load pending order
    const { data: orderRow } = await supabase.from('orders').select('*').eq('order_id', orderId).single();

    if (!orderRow) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/order-confirmation?orderId=${orderId}`);
    }

    // Amount check: non-COD must equal grand total, COD must equal the COD fee
    const expectedAmount = udf2 === 'cod' ? COD_FEE : Number(orderRow.grand_total);
    const amountMatches = Math.abs(Number(amount) - expectedAmount) < 0.01;

    // Also ensure the txnid matches the one we generated for this order
    const txnMatches = !orderRow.txn_id || orderRow.txn_id === txnid;

    const success = hashValid && amountMatches && txnMatches && payuStatus === 'success' && expectedStatus === 'success';

    const newStatus = success ? 'paid' : 'failed';
    const updates: Record<string, any> = {
      payment_status: success ? (udf2 === 'cod' ? 'cod_confirmed' : 'paid') : 'failed',
      order_status: success ? (udf2 === 'cod' ? 'cod_confirmed' : 'pending') : 'cancelled',
      pg_txn_id: mihpayid || null,
      pg_status: payuStatus || null,
      pg_error: success ? null : (hashValid ? (error || (payuStatus === 'success' ? 'order verification failed' : payuStatus)) : 'hash_mismatch'),
    };

    if (success) {
      // Append PayU payment info to notes (order may already have COD notes)
      const prevNotes = orderRow.notes || '';
      const payuLine = `[PayU: ${mihpayid} | ${amount} paid via ${udf2}]`;
      updates.notes = prevNotes ? `${prevNotes} ${payuLine}` : payuLine;
    }

    const { error: updateError } = await supabase.from('orders').update(updates).eq('order_id', orderId);
    if (updateError) console.error('order update failed:', updateError.message);

    if (success) {
      await decrementStock(orderId);
    }

    // Build email payload
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);

    const emailPayload = {
      orderId,
      txnId: mihpayid || txnid,
      name: orderRow.customer_name,
      email: orderRow.customer_email,
      phone: orderRow.customer_phone,
      address: orderRow.address,
      city: orderRow.city,
      state: orderRow.state,
      country: orderRow.country,
      pincode: orderRow.pincode,
      paymentMethod: udf2 || orderRow.payment_method,
      items: items?.map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity, color: i.color, size: i.size, image: i.image })) || [],
      subtotal: Number(orderRow.subtotal),
      discount: Number(orderRow.discount),
      shipping: Number(orderRow.shipping),
      tax: Number(orderRow.tax),
      grandTotal: Number(orderRow.grand_total),
      codFee: (udf2 === 'cod' ? COD_FEE : 0),
      dueOnDelivery: (udf2 === 'cod' ? Math.max(0, Number(orderRow.grand_total) - COD_FEE) : 0),
    };

    // Send emails only on success
    if (success) {
      try {
        let brand: { email: string; brand: string; address: string } | undefined;
        let merchantEmail: string | undefined;
        const { data: configs } = await supabase.from('site_config').select('*');
        const site = configs?.find((c) => c.key === 'site');
        if (site?.value) {
          merchantEmail = site.value.email;
          brand = { email: site.value.email, brand: site.value.brand, address: site.value.address };
        }
        const [customerRes, merchantRes] = await Promise.all([
          sendCustomerOrderConfirmation(emailPayload, brand),
          sendMerchantOrderNotification(emailPayload, merchantEmail, brand),
        ]);
        console.log(`[OrderEmail] ${orderId} customer=${customerRes.success ? 'sent' : 'FAILED:' + (customerRes.error || '?')} merchant=${merchantRes.success ? 'sent' : 'FAILED:' + (merchantRes.error || '?')}`);
      } catch (e) {
        console.error(`[OrderEmail] ${orderId} send error:`, e);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    if (success) {
      return NextResponse.redirect(`${baseUrl}/order-confirmation?orderId=${orderId}`);
    }
    return NextResponse.redirect(`${baseUrl}/checkout?payment=failed&orderId=${orderId}`);
  } catch (e: any) {
    console.error('payu return error:', e);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/checkout?payment=error`);
  }
}

async function decrementStock(orderId: string) {
  try {
    const { data: items } = await supabase.from('order_items').select('product_id, quantity').eq('order_id', orderId);
    if (!items?.length) return;

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('id, stock')
        .eq('id', item.product_id)
        .single();
      if (product) {
        const newStock = Math.max(0, Number(product.stock) - Number(item.quantity));
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);
      }
    }
  } catch (e) {
    console.error('stock decrement failed:', e);
  }
}

export async function GET(request: Request) {
  // In case PayU redirects via GET
  return POST(request);
}