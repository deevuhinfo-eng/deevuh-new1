import { NextResponse } from 'next/server';
import { createAnonClient as createSupabaseClient } from '@/lib/supabase/admin';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return NextResponse.json({
      session: data.session,
      user: data.user,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
