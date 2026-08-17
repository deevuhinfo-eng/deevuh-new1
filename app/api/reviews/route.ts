import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { reviews as fallbackReviews } from '@/lib/config';
import type { ReviewRow } from '@/lib/supabase/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
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
