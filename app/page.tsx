import { SiteShell } from '@/components/site-shell';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Hero } from '@/components/sections/hero';
import { CollectionSection } from '@/components/sections/collection-section';
import { BrandStory } from '@/components/sections/brand-story';
import { ReviewsSection } from '@/components/sections/reviews';
import { NewsletterSection } from '@/components/sections/newsletter';
import { products as fallbackProducts } from '@/lib/products';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapProduct } from '@/lib/supabase/mappers';
import type { ProductRow } from '@/lib/supabase/types';
import type { Product } from '@/lib/types';

async function getHomeProducts(): Promise<Product[]> {
  try {
    const { data, error } = await createAdminClient()
      .from('products')
      .select('*')
      .eq('hidden', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (Array.isArray(data) && data.length > 0) return (data as ProductRow[]).map(mapProduct);
    throw new Error('empty');
  } catch {
    return fallbackProducts.filter((p) => !p.hidden);
  }
}

export default async function HomePage() {
  const visible = await getHomeProducts();
  const featured = visible.filter((p) => p.featured).slice(0, 4);
  const newArrivals = visible.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = visible.filter((p) => p.bestSeller).slice(0, 4);
  const limited = visible.filter((p) => p.limitedEdition).slice(0, 3);
  const summer = visible.filter((p) => p.summerCollection).slice(0, 4);

  const section = (id: string, eyebrow: string, title: string, description: string, items: typeof featured, layout?: 'feature' | 'grid') =>
    items.length > 0 ? <CollectionSection id={id} eyebrow={eyebrow} title={title} description={description} products={items} layout={layout} /> : null;

  return (
    <SiteShell>
      <AnnouncementBar />
      <Hero />
      {section('featured', 'Curated Selection', 'Featured Collection', 'Our most coveted pieces, chosen by the atelier.', featured, 'feature')}
      <BrandStory />
      {section('new', 'Just Arrived', 'New Arrivals', 'The latest additions to the atelier.', newArrivals)}
      {section('bestseller', 'Client Favourites', 'Best Sellers', 'The pieces our clients return to again and again.', bestSellers)}
      {section('limited', 'By Appointment', 'Limited Edition', 'Numbered pieces in extremely limited quantities.', limited)}
      {section('summer', 'The Season', 'Summer Collection', 'Lightweight fabrics for the warmer months.', summer)}
      <ReviewsSection />
      <NewsletterSection />
    </SiteShell>
  );
}
