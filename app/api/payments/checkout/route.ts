import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminSession } from '@/lib/admin-auth';
import { payuConfig, generatePayuHash, formatPayuAmount } from '@/lib/payu';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PG_MODE_MAP: Record<string, { pg?: string; bankcode?: string }> = {
  upi: { pg: 'UPI', bankcode: 'UPI' },
  card: { pg: 'CC', bankcode: 'CC' },
  netbanking: { pg: 'NB', bankcode: 'NB' },
  wallet: { pg: 'WALLET', bankcode: 'WALLET' },
  cod: { pg: 'UPI', bankcode: 'UPI' },
};

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, txnId, paymentMethod, amount, pgMode, customer, form, items, totals } = body;
    const userId = session.user.id;

    const payu = payuConfig();
    const isCod = paymentMethod === 'cod';
    const payAmount = amount; // already computed on client (grandTotal or codFee)

    // Client already builds the full note (includes COD fee info). Fallback for safety.
    const notes = body.notes || form.notes || null;
    const { error: orderError } = await supabase.from('orders').insert({
      order_id: orderId,
      txn_id: txnId,
      customer_id: userId,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      pincode: form.pincode,
      notes,
      payment_method: paymentMethod,
      subtotal: totals.subtotal,
      discount: totals.discount || 0,
      shipping: totals.shipping || 0,
      tax: totals.tax || 0,
      grand_total: totals.grandTotal,
      coupon_code: body.couponCode || null,
      order_status: 'pending',
      payment_status: 'pending',
    });

    if (orderError) {
      console.error('order insert failed:', orderError.message);
      throw new Error('Failed to save order');
    }

    if (items?.length) {
      await supabase.from('order_items').insert(
        items.map((item: any) => ({
          order_id: orderId,
          product_id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image || '',
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }))
      );
    }

    // Build PayU params
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const mode = PG_MODE_MAP[pgMode] || {};
    const firstname = (form.name || 'Customer').split(' ')[0] || 'Customer';

    const params = {
      key: payu.key,
      txnid: txnId,
      amount: formatPayuAmount(payAmount),
      productinfo: `DEEVUH Order ${orderId}${isCod ? ' (COD Fee)' : ''}`,
      firstname,
      email: form.email,
      phone: form.phone,
      surl: `${siteUrl}/api/payments/return?status=success`,
      furl: `${siteUrl}/api/payments/return?status=failure`,
      curl: `${siteUrl}/checkout`,
      udf1: orderId,
      udf2: paymentMethod,
      ...mode,
    };

    const hash = generatePayuHash({
      key: payu.key,
      txnid: params.txnid,
      amount: params.amount,
      productinfo: params.productinfo,
      firstname: params.firstname,
      email: params.email,
      udf1: params.udf1,
      udf2: params.udf2,
      salt: payu.salt,
    });

    // Return auto-submit HTML form
    const fields = Object.entries(params)
      .map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeHtml(String(value))}" />`)
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<head><title>Redirecting to Payment…</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5">
  <div style="text-align:center">
    <p style="color:#666">Redirecting to secure payment gateway…</p>
    <form id="payuForm" method="POST" action="${payu.endpoint}">
      ${fields}
      <input type="hidden" name="hash" value="${hash}" />
      <noscript><button type="submit">Continue to Payment</button></noscript>
    </form>
    <script>document.getElementById('payuForm').submit();</script>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
