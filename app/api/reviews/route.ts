import { NextResponse } from 'next/server';
import { createAdminClient as createSupabaseClient } from '@/lib/supabase/admin';
import { reviews as fallbackReviews } from '@/lib/config';
import type { ReviewRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

let supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!supabase) supabase = createSupabaseClient();
  return supabase;
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ reviews: mapReviews(data) });
  } catch {
    return NextResponse.json({ reviews: fallbackReviews });
  }
}

function mapReviews(data: ReviewRow[]) {
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
  }));
}
