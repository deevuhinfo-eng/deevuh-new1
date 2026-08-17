import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { products as fallbackProducts } from '@/lib/products';
import type { ProductRow } from '@/lib/supabase/types';
import { mapProduct, toRow } from '@/lib/supabase/mappers';
import type { Product } from '@/lib/types';
import { requireAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COMBO_MARKER = '__combo';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const featured = searchParams.get('featured');
  const ids = searchParams.get('ids');
  const all = searchParams.get('all') === 'true';

  try {
    if (slug) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return NextResponse.json({ products: data ? mapProduct(data) : null });
    }

    let query = supabase.from('products').select('*');
    if (!all) query = query.eq('hidden', false);

    if (category) query = query.eq('category', category);
    if (tag) {
      if (tag === 'featured') query = query.eq('featured', true);
      else if (tag === 'new') query = query.eq('is_new', true);
      else if (tag === 'bestseller') query = query.eq('best_seller', true);
      else if (tag === 'limited') query = query.eq('limited_edition', true);
      else if (tag === 'summer') query = query.eq('summer_collection', true);
      else query = query.contains('tags', [tag]);
    }
    if (featured === 'true') query = query.eq('featured', true);
    if (ids) query = query.in('id', ids.split(','));
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ products: mapProducts(data) });
  } catch {
    // Fallback
    let result = all ? fallbackProducts : fallbackProducts.filter((p) => !p.hidden);
    if (slug) result = result.filter((p) => p.slug === slug);
    if (category) result = result.filter((p) => p.category === category);
    if (tag) {
      if (['featured', 'new', 'bestseller', 'limited', 'summer'].includes(tag)) {
        const key = tag === 'new' ? 'isNew' : tag === 'bestseller' ? 'bestSeller' : tag === 'summer' ? 'summerCollection' : tag;
        result = result.filter((p) => p[key as keyof typeof p] === true);
      }
    }
    if (featured) result = result.filter((p) => p.featured);
    if (ids) result = result.filter((p) => ids.split(',').includes(p.id));

    return NextResponse.json({ products: slug ? result[0] || null : result });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const body: Product = await request.json();
    const payload = toRow(body);
    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return NextResponse.json({ success: true, product: body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function mapProducts(data: ProductRow | ProductRow[] | null) {
  if (!data) return null;
  if (Array.isArray(data)) return data.map(mapProduct);
  return mapProduct(data);
}
