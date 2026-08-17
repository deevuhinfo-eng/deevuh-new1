'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

interface CollectionSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
  layout?: 'grid' | 'feature';
}

export function CollectionSection({ id, eyebrow, title, description, products, viewAllHref = '/shop', layout = 'grid' }: CollectionSectionProps) {
  if (layout === 'feature' && products.length > 0) {
    const [main, ...rest] = products;
    return (
      <section id={id} className="container-lux py-20 md:py-32">
        <Reveal className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="heading-2 mt-3">{title}</h2>
            {description && <p className="mt-4 max-w-md text-sm text-muted-foreground">{description}</p>}
          </div>
          <Link href={viewAllHref} className="link-underline flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em]">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="lg:row-span-2">
            <Link href={`/product/${main.slug}`} className="zoom-container group block h-full min-h-[400px] overflow-hidden rounded-2xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={main.images[0].url} alt={main.images[0].alt} className="zoom-img h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-8 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="text-white">
                  <p className="eyebrow text-white/70">{main.category}</p>
                  <p className="mt-1 font-display text-2xl">{main.name}</p>
                </div>
              </div>
            </Link>
          </Reveal>
          {rest.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="container-lux py-20 md:py-32">
      <Reveal className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="heading-2 mt-3">{title}</h2>
          {description && <p className="mt-4 max-w-md text-sm text-muted-foreground">{description}</p>}
        </div>
        <Link href={viewAllHref} className="link-underline flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em]">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
