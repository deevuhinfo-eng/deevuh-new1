import { SiteShell } from '@/components/site-shell';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Hero } from '@/components/sections/hero';
import { CollectionSection } from '@/components/sections/collection-section';
import { BrandStory } from '@/components/sections/brand-story';
import { SaleCountdown } from '@/components/sections/sale-countdown';
import { ReviewsSection } from '@/components/sections/reviews';
import { InstagramGallery } from '@/components/sections/instagram';
import { NewsletterSection } from '@/components/sections/newsletter';
import { products } from '@/lib/products';

export default function HomePage() {
  const visible = products.filter((p) => !p.hidden);
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
      <SaleCountdown />
      {section('limited', 'By Appointment', 'Limited Edition', 'Numbered pieces in extremely limited quantities.', limited)}
      {section('summer', 'The Season', 'Summer Collection', 'Lightweight fabrics for the warmer months.', summer)}
      <ReviewsSection />
      <InstagramGallery />
      <NewsletterSection />
    </SiteShell>
  );
}
