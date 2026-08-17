import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const email = session.user.email || '';
    const meta = (session.user.user_metadata || {}) as Record<string, any>;
    const name = meta.full_name || meta.name || email.split('@')[0] || '';
    const avatar = meta.avatar_url || meta.picture || meta.avatar || '';

    // Upsert profile (auto-create on first visit)
    await supabase.from('profiles').upsert(
      {
        id: userId,
        email,
        name,
        avatar_url: avatar,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return NextResponse.json({ profile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const fields = ['name', 'phone', 'address', 'city', 'state', 'country', 'pincode'] as const;
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const f of fields) {
      if (typeof body[f] === 'string') update[f] = body[f].trim();
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}