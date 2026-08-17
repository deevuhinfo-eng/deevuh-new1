import { NextResponse } from 'next/server';
import { createAdminClient as createSupabaseClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/admin-auth';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: orders, error } = await getSupabase()
      .from('orders')
      .select('*')
      .eq('customer_id', session.user.id)
      .order('placed_at', { ascending: false });

    if (error) throw error;

    let itemsByOrder: Record<string, any[]> = {};
    if (orders?.length) {
      const ids = orders.map((o) => o.order_id);
      const { data: items } = await getSupabase()
        .from('order_items')
        .select('*')
        .in('order_id', ids);
      if (items?.length) {
        itemsByOrder = items.reduce((acc, it) => {
          (acc[it.order_id] = acc[it.order_id] || []).push(it);
          return acc;
        }, {} as Record<string, any[]>);
      }
    }

    return NextResponse.json({ orders: orders || [], itemsByOrder });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}