import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ authenticated: false, admin: false });
    }
    const { data, error } = await createAdminClient()
      .from('admin_users')
      .select('email')
      .eq('email', session.user.email)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ authenticated: true, admin: false });
    }
    return NextResponse.json({ authenticated: true, admin: !!data });
  } catch {
    return NextResponse.json({ authenticated: false, admin: false });
  }
}