import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_SIZE = 300 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Image too large (${Math.round(file.size / 1024)}kb). Max 300kb.` }, { status: 413 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG or WebP allowed.' }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[file.type]}`;
    const path = `products/${name}`;

    const { error } = await supabase.storage.from('images').upload(path, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
