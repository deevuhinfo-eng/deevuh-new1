import { NextResponse } from 'next/server';
import { createAdminClient as createSupabaseClient } from '@/lib/supabase/admin';
import { coupons as fallbackCoupons } from '@/lib/config';
import type { CouponRow } from '@/lib/supabase/types';
import { requireAdmin } from '@/lib/admin-auth';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('coupons')
      .select('*')
      .eq('active', true);

    if (error) throw error;
    return NextResponse.json({ coupons: mapCoupons(data) });
  } catch {
    return NextResponse.json({ coupons: fallbackCoupons });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const body = await request.json();
    const { error } = await getSupabase().from('coupons').upsert(
      {
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        min_subtotal: body.minSubtotal || 0,
        active: body.active !== undefined ? body.active : true,
        description: body.description || '',
        expires_at: body.expiresAt || null,
      },
      { onConflict: 'code' }
    );
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const body = await request.json();
    const { error } = await getSupabase()
      .from('coupons')
      .delete()
      .eq('code', body.code);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function mapCoupons(data: CouponRow[]) {
  return data.map((c) => ({
    code: c.code,
    type: c.type as 'percent' | 'fixed',
    value: c.value,
    minSubtotal: c.min_subtotal,
    active: c.active,
    expiresAt: c.expires_at,
    description: c.description,
  }));
}
