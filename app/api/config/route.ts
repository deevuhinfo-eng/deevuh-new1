import { NextResponse } from 'next/server';
import { createAdminClient as createSupabaseClient } from '@/lib/supabase/admin';
import { siteConfig as fallbackConfig } from '@/lib/config';
import { requireAdmin } from '@/lib/admin-auth';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('site_config')
      .select('*');

    if (error) throw error;

    if (data && data.length > 0) {
      const config = data.find((d) => d.key === 'site');
      if (config) return NextResponse.json({ config: config.value });
    }
    throw new Error('no config found');
  } catch {
    return NextResponse.json({ config: fallbackConfig });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const body = await request.json();
    const { error } = await getSupabase()
      .from('site_config')
      .upsert({ key: 'site', value: body }, { onConflict: 'key' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
