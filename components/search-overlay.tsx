'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { products } from '@/lib/products';
import { formatPrice, discountPercent } from '@/lib/format';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter((p) => !p.hidden && (p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.category.includes(q)))
      .slice(0, 5);
  }, [query]);

  const popular = ['Co-ord Set', 'Linen', 'Silk Blouse', 'Trousers', 'Skirt', 'Combo'];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-background/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="mt-[12vh] w-full max-w-2xl px-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-strong rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the atelier..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                />
                <button onClick={() => onOpenChange(false)} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {query.trim() === '' ? (
                <div className="pt-4">
                  <p className="eyebrow mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((term) => (
                      <button key={term} onClick={() => setQuery(term)} className="rounded-full border border-border px-4 py-2 text-xs transition-colors hover:bg-accent">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                <div className="pt-4">
                  <p className="eyebrow mb-3">Products</p>
                  <div className="space-y-2">
                    {results.map((p) => {
                      const disc = discountPercent(p.price, p.compareAtPrice);
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={() => { onOpenChange(false); setQuery(''); }}
                          className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0].url} alt={p.images[0].alt} className="h-14 w-12 rounded-md object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.tagline}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatPrice(p.price)}</p>
                            {disc > 0 && <p className="text-xs text-destructive">{disc}% off</p>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
