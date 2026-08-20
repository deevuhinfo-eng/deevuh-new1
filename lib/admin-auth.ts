import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAdminClient } from './supabase/admin';
import type { Database } from './supabase/types';

export async function getAdminSession() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env config (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Set these in your deployment environment variables.'
    );
  }
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only: sessions are only validated, never refreshed from these routes
        },
      },
    }
  );
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await createAdminClient()
    .from('admin_users')
    .select('email')
    .eq('email', session.user.email)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: 'Server error checking admin access' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Forbidden: not an admin' }, { status: 403 });
  }
  return null;
}
