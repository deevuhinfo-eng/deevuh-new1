'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Trash2, ExternalLink, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  productId: string | null;
  date: string;
  verified: boolean;
  email: string | null;
}

interface ProductMeta {
  id: string;
  name: string;
  slug: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<Record<string, ProductMeta>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsRes, productsRes] = await Promise.all([
          fetch('/api/reviews?admin=1'),
          fetch('/api/products?all=true'),
        ]);
        const reviewsJson = await reviewsRes.json();
        const productsJson = await productsRes.json();
        if (Array.isArray(reviewsJson.reviews)) setReviews(reviewsJson.reviews);
        if (Array.isArray(productsJson.products)) {
          const map: Record<string, ProductMeta> = {};
          productsJson.products.forEach((p: any) => {
            map[p.id] = { id: p.id, name: p.name, slug: p.slug };
          });
          setProducts(map);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const removeReview = async (review: AdminReview) => {
    setDeleting(review.id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id }),
      });
      if (!res.ok) throw new Error('Failed');
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">{reviews.length} total reviews · {reviews.filter((r) => r.verified).length} verified purchases</p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-background py-16 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1} />
          <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Reviews appear here as verified buyers publish them.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Reviewer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4 min-w-[220px]">Review</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, i) => {
                const product = review.productId ? products[review.productId] : undefined;
                return (
                  <motion.tr key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <p className="font-medium">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.email || '—'}</p>
                      {review.location && <p className="text-xs text-muted-foreground/70">{review.location}</p>}
                    </td>
                    <td className="p-4">
                      {product ? (
                        <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">
                          {product.name} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className={cn('h-3.5 w-3.5', s < review.rating ? 'fill-foreground text-foreground' : 'text-muted-foreground/20')} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {review.title && <p className="text-xs font-semibold">{review.title}</p>}
                      <p className="text-xs leading-relaxed text-muted-foreground">{review.body}</p>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4">
                      <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider', review.verified ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                        {review.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {review.email && (
                          <a href={`/admin/orders?email=${encodeURIComponent(review.email)}`} className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs transition-colors hover:bg-accent">
                            View Orders
                          </a>
                        )}
                        <button onClick={() => removeReview(review)} disabled={deleting === review.id} className="flex h-8 w-8 items-center justify-center rounded-md border border-destructive/50 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50" aria-label="Delete review">
                          {deleting === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}