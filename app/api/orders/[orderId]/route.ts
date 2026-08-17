import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sendOrderStatusEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', params.orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', params.orderId);

    if (itemsError) throw itemsError;

    return NextResponse.json({ order, items: items || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', params.orderId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const body = await request.json();
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: body.status })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) throw error;

    // Notify the customer on status change (fire-and-forget so the admin
    // panel stays fast). Only client receives status emails; the merchant
    // gets the initial order notification only.
    if (data && body.status && body.status !== 'pending' && body.status !== 'cod_confirmed') {
      const orderId = params.orderId;
      const status = body.status;
      const isCod = data.payment_method === 'cod';
      (async () => {
        try {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

          let brand: { email: string; brand: string; address: string } | undefined;
          const { data: configs } = await supabase.from('site_config').select('*');
          const site = configs?.find((c) => c.key === 'site');
          if (site?.value) brand = { email: site.value.email, brand: site.value.brand, address: site.value.address };

          const payload = {
            orderId,
            txnId: data.txn_id,
            name: data.customer_name,
            email: data.customer_email,
            phone: data.customer_phone,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
            paymentMethod: data.payment_method,
            codFee: isCod ? 149 : 0,
            dueOnDelivery: isCod ? Math.max(0, Number(data.grand_total) - 149) : 0,
            items: (items || []).map((i: any) => ({ name: i.name, price: Number(i.price), quantity: i.quantity, color: i.color, size: i.size, image: i.image })),
            subtotal: Number(data.subtotal),
            discount: Number(data.discount || 0),
            shipping: Number(data.shipping || 0),
            tax: Number(data.tax || 0),
            grandTotal: Number(data.grand_total),
          };

          const res = await sendOrderStatusEmail(payload, status, brand);
          console.log(`[OrderStatus] ${orderId} → ${status} email=${res.success ? 'sent' : 'FAILED:' + (res.error || '?')}`);
        } catch (e) {
          console.error(`[OrderStatus] ${orderId} error:`, e);
        }
      })();
    }

    return NextResponse.json({ order: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}