import { NextResponse } from 'next/server';
import { createAdminClient as createSupabaseClient } from '@/lib/supabase/admin';
import { getAdminSession, requireAdmin } from '@/lib/admin-auth';
import { reviews as fallbackReviews } from '@/lib/config';
import type { ReviewRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

const PAID_STATUSES = ['paid', 'cod_confirmed'];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const admin = url.searchParams.get('admin') === 'true';

    const session = await getAdminSession();
    const isAdmin = !!(session?.user?.email && (await requireAdmin()) === null);

    let query = getSupabase().from('reviews').select('*');
    if (productId) query = query.eq('product_id', productId);
    query = query.order('date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    if (isAdmin) {
      return NextResponse.json({ reviews: mapReviews(data, true) });
    }
    if (admin) {
      return NextResponse.json({ reviews: mapReviews(data, false), admin: isAdmin });
    }
    return NextResponse.json({ reviews: mapReviews(data) });
  } catch {
    return NextResponse.json({ reviews: fallbackReviews });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Please login to write a review' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, title, body: reviewBody, name, location } = body;

    if (!productId || !rating || !reviewBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const stars = Number(rating);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const email = session.user.email;
    const userId = session.user.id;

    // Only verified buyers: must have a paid order containing this product
    const { data: orderIds, error: itemsError } = await getSupabase()
      .from('order_items')
      .select('order_id')
      .eq('product_id', productId);
    if (itemsError) throw itemsError;

    let paid;
    if (orderIds?.length) {
      const ids = orderIds.map((o) => o.order_id);
      paid = await getSupabase()
        .from('orders')
        .select('order_id')
        .or(`customer_email.eq.${email},customer_id.eq.${userId}`)
        .in('payment_status', PAID_STATUSES)
        .in('order_id', ids);
    }
    if (paid?.error) throw paid.error;
    if (!paid?.data?.length) {
      return NextResponse.json(
        { error: 'Only verified buyers can review this item. Purchase it first to share your experience.' },
        { status: 403 }
      );
    }

    // One review per buyer per product
    const existing = await getSupabase()
      .from('reviews')
      .select('id')
      .eq('email', email)
      .eq('product_id', productId)
      .maybeSingle();
    if (existing.error && existing.error.code !== '42703') throw existing.error;
    if (existing.data) {
      return NextResponse.json({ error: 'You have already reviewed this item' }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('reviews')
      .insert({
        name: name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Verified Buyer',
        location: location || '',
        rating: stars,
        title: title || '',
        body: reviewBody,
        product_id: productId,
        date: new Date().toISOString(),
        verified: true,
        email,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42703') {
        return NextResponse.json(
          { error: 'Review store is not ready yet. The site owner needs to run the reviews email-column migration.' },
          { status: 500 }
        );
      }
      throw error;
    }

    const ratingSummary = await refreshProductRating(productId);
    return NextResponse.json({ review: data, ...ratingSummary }, { status: 201 });
  } catch (e: any) {
    console.error('/api/reviews POST failed:', e?.message, e?.code, e?.details);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Review id required' }, { status: 400 });

    const { data: review, error: fetchError } = await getSupabase()
      .from('reviews')
      .select('product_id')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const { error } = await getSupabase().from('reviews').delete().eq('id', id);
    if (error) throw error;

    if (review?.product_id) await refreshProductRating(review.product_id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('/api/reviews DELETE failed:', e?.message, e?.code, e?.details);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}

async function refreshProductRating(productId: string) {
  const { data, error } = await getSupabase()
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);
  if (error) throw error;

  const ratings = (data ?? []).map((r) => r.rating);
  const count = ratings.length;
  const avg = count
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10
    : 0;

  await getSupabase().from('products').update({ rating: avg, review_count: count }).eq('id', productId);
  return { rating: avg, reviewCount: count };
}

function mapReviews(data: ReviewRow[], includeEmail = false) {
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    rating: r.rating,
    title: r.title,
    body: r.body,
    productId: r.product_id,
    date: r.date,
    verified: r.verified,
    ...(includeEmail ? { email: r.email } : {}),
  }));
}
