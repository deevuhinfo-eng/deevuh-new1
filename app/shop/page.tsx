'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SiteShell } from '@/components/site-shell';
import { ProductCard } from '@/components/product-card';
import { products, categoryLabels } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import { SlidersHorizontal, X, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductCategory } from '@/lib/types';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const allColors = Array.from(new Set(products.flatMap((p) => p.variants.map((v) => v.color))));
const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes.map((s) => s.name))));
const maxPrice = Math.max(...products.map((p) => p.price));

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ShopPageInner />
    </Suspense>
  );
}

function ShopPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(searchParams.get('category'));
  const [tag, setTag] = useState<string | null>(searchParams.get('tag'));
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    setCategory(searchParams.get('category'));
    setTag(searchParams.get('tag'));
    if (searchParams.get('sort')) setSortBy(searchParams.get('sort')!);
  }, [searchParams]);

  const toggleColor = (c: string) => setSelectedColors((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const toggleSize = (s: string) => setSelectedSizes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const filtered = useMemo(() => {
    let result = products.filter((p) => !p.hidden);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.category.includes(q));
    }
    if (category) result = result.filter((p) => p.category === category);
    if (tag) result = result.filter((p) => p.tags.includes(tag as any));
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedColors.length) result = result.filter((p) => p.variants.some((v) => selectedColors.includes(v.color)));
    if (selectedSizes.length) result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s.name)));

    switch (sortBy) {
      case 'price-asc': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'bestselling': result = [...result].sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [query, category, tag, sortBy, priceRange, selectedColors, selectedSizes]);

  const clearAll = () => {
    setQuery(''); setCategory(null); setTag(null); setPriceRange([0, maxPrice]); setSelectedColors([]); setSelectedSizes([]); router.push('/shop');
  };
  const activeFilterCount = (category ? 1 : 0) + (tag ? 1 : 0) + selectedColors.length + selectedSizes.length + (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">Category</p>
        <div className="space-y-2">
          <button onClick={() => { setCategory(null); router.push('/shop'); }} className={cn('block text-sm transition-colors', !category ? 'font-medium' : 'text-muted-foreground hover:text-foreground')}>All Products</button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button key={key} onClick={() => { setCategory(key); router.push(`/shop?category=${key}`); }} className={cn('block text-sm transition-colors', category === key ? 'font-medium' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Price Range</p>
        <div className="flex items-center justify-between text-sm">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
        <input type="range" min={0} max={maxPrice} step={50} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="mt-2 w-full" />
      </div>

      <div>
        <p className="eyebrow mb-3">Color</p>
        <div className="space-y-2">
          {allColors.map((c) => (
            <button key={c} onClick={() => toggleColor(c)} className="flex items-center gap-2 text-sm transition-colors hover:text-foreground">
              <span className={cn('flex h-4 w-4 items-center justify-center rounded border', selectedColors.includes(c) ? 'border-foreground bg-foreground text-background' : 'border-border')}>
                {selectedColors.includes(c) && <Check className="h-3 w-3" />}
              </span>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button key={s} onClick={() => toggleSize(s)} className={cn('flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs transition-colors', selectedSizes.includes(s) ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-accent')}>{s}</button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearAll} className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-3 w-3" /> Clear All ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <SiteShell>
      <div className="border-b border-border">
        <div className="container-lux py-12 md:py-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow">The Collection</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="heading-2 mt-3">
            {category ? categoryLabels[category] : tag ? tag.charAt(0).toUpperCase() + tag.slice(1) + ' Edition' : 'All Pieces'}
          </motion.h1>
          <p className="mt-3 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</p>
        </div>
      </div>

      <div className="container-lux py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs lg:hidden">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters {activeFilterCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">{activeFilterCount}</span>}
                </button>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-full border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-foreground">
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="font-display text-2xl">No pieces found</p>
                <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters</p>
                <button onClick={clearAll} className="mt-6 rounded-full border border-border px-6 py-3 text-xs uppercase tracking-wider transition-colors hover:bg-accent">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div className="fixed inset-0 z-[200] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setShowFilters(false)} />
            <motion.div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-background p-6" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ ease: [0.16, 1, 0.3, 1] }}>
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-lg">Filters</p>
                <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>
              <FilterContent />
              <button onClick={() => setShowFilters(false)} className="btn-lux mt-8 w-full bg-foreground text-background">Show {filtered.length} Results</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteShell>
  );
}
