import { NextResponse } from 'next/server';
import { createAdminClient as createSupabaseClient } from '@/lib/supabase/admin';
import { sendCustomerOrderConfirmation, sendMerchantOrderNotification } from '@/lib/email';
import { requireAdmin } from '@/lib/admin-auth';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const body = await request.json();

    let merchantEmail: string | undefined;
    let brand: { email: string; brand: string; address: string } | undefined;

    try {
      const { data } = await getSupabase().from('site_config').select('*');
      const config = data?.find((d) => d.key === 'site');
      if (config?.value) {
        merchantEmail = config.value.email;
        brand = {
          email: config.value.email,
          brand: config.value.brand,
          address: config.value.address,
        };
      }
    } catch {}

    // If only orderId given, build the full payload from the database.
    let payload = body;
    if (body.orderId && !body.items) {
      const { data: order } = await getSupabase()
        .from('orders')
        .select('*')
        .eq('order_id', body.orderId)
        .single();
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const { data: items } = await getSupabase()
        .from('order_items')
        .select('*')
        .eq('order_id', body.orderId);

      const isCod = order.payment_method === 'cod';
      payload = {
        orderId: order.order_id,
        txnId: order.txn_id,
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.address,
        city: order.city,
        state: order.state,
        country: order.country,
        pincode: order.pincode,
        paymentMethod: order.payment_method,
        codFee: isCod ? 149 : 0,
        dueOnDelivery: isCod ? Math.max(0, Number(order.grand_total) - 149) : 0,
        items: (items || []).map((i: any) => ({ name: i.name, price: Number(i.price), quantity: i.quantity, color: i.color, size: i.size, image: i.image })),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount || 0),
        shipping: Number(order.shipping || 0),
        tax: Number(order.tax || 0),
        grandTotal: Number(order.grand_total),
      };
    }

    const [customerResult, merchantResult] = await Promise.all([
      sendCustomerOrderConfirmation(payload, brand),
      sendMerchantOrderNotification(payload, merchantEmail, brand),
    ]);

    return NextResponse.json({
      customer: customerResult,
      merchant: merchantResult,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
