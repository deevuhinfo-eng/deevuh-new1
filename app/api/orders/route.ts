import { NextResponse } from 'next/server';
import { createAdminClient as createSupabaseClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-auth';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { data, error } = await getSupabase()
      .from('orders')
      .select('*')
      .order('placed_at', { ascending: false });

    if (error) throw error;

    let itemsByOrder: Record<string, any[]> = {};
    if (data?.length) {
      const { data: items, error: itemsError } = await getSupabase()
        .from('order_items')
        .select('*')
        .in('order_id', data.map((o: any) => o.order_id));
      if (!itemsError && items?.length) {
        itemsByOrder = items.reduce((acc: Record<string, any[]>, item: any) => {
          (acc[item.order_id] = acc[item.order_id] || []).push(item);
          return acc;
        }, {});
      }
    }

    return NextResponse.json({ orders: data, itemsByOrder });
  } catch {
    return NextResponse.json({ orders: [], itemsByOrder: {} });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const body = await request.json();
    const { data, error } = await getSupabase()
      .from('orders')
      .insert({
        order_id: body.orderId,
        txn_id: body.txnId,
        customer_name: body.customerName || body.name,
        customer_email: body.customerEmail || body.email,
        customer_phone: body.customerPhone || body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        pincode: body.pincode,
        notes: body.notes ? (body.paymentMethod === 'cod' ? `${body.notes} [COD Fee: ₹${body.codFee ?? 149} paid, ₹${body.dueOnDelivery ?? 0} due on delivery]` : body.notes) : (body.paymentMethod === 'cod' ? `[COD Fee: ₹${body.codFee ?? 149} paid, ₹${body.dueOnDelivery ?? 0} due on delivery]` : null),
        payment_method: body.paymentMethod,
        subtotal: body.subtotal,
        discount: body.discount || 0,
        shipping: body.shipping || 0,
        tax: body.tax || 0,
        grand_total: body.grandTotal,
        coupon_code: body.couponCode || null,
        order_status: 'pending',
        placed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    if (body.items?.length) {
      const orderItems = body.items.map((item: any) => ({
        order_id: body.orderId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || '',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));
      await getSupabase().from('order_items').insert(orderItems);
    }

    return NextResponse.json({ order: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
