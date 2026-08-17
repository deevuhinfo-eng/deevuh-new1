'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Eye, EyeOff, Tag, Star, Trash2, X, Search, Download, Save, Loader2, Layers, UploadCloud } from 'lucide-react';
import { categoryLabels } from '@/lib/products';
import { formatPrice, slugify } from '@/lib/format';
import type { Product, ProductCategory, ProductSize, ComboItem } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const blankProduct = (): Product => ({
  id: 'p' + Math.random().toString(36).slice(2, 8),
  slug: '',
  name: '',
  category: 'coordsets',
  tagline: '',
  description: '',
  price: 0,
  currency: 'INR',
  images: [],
  variants: [{ color: 'Default', colorHex: '#888888', images: [] }],
  sizes: [],
  specs: [],
  tags: ['new'],
  rating: 5,
  reviewCount: 0,
  stock: 10,
  shippingInfo: 'Free express shipping. Ships within 2 business days.',
  returnPolicy: '30-day returns on unworn items with original tags.',
  featured: false,
  isNew: true,
  bestSeller: false,
  limitedEdition: false,
  summerCollection: false,
  hidden: false,
  saleEnabled: false,
  createdAt: new Date().toISOString(),
});

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?all=true');
      const json = await res.json();
      if (json.products?.length) {
        setProductList(json.products);
        return;
      }
      throw new Error('empty');
    } catch {
      const { products } = await import('@/lib/products');
      setProductList(products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!query) return productList;
    const q = query.toLowerCase();
    return productList.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q));
  }, [productList, query]);

  const persist = useCallback(async (updated: Product) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to save');
  }, []);

  const toggleHidden = async (id: string) => {
    const p = productList.find((x) => x.id === id);
    if (!p) return;
    const updated = { ...p, hidden: !p.hidden };
    try {
      await persist(updated);
      setProductList((prev) => prev.map((x) => x.id === id ? updated : x));
      toast.success(updated.hidden ? 'Product hidden' : 'Product shown');
    } catch {
      toast.error('Failed to save');
    }
  };

  const toggleFlag = async (id: string, key: 'saleEnabled' | 'bestSeller' | 'featured' | 'isNew' | 'limitedEdition') => {
    const p = productList.find((x) => x.id === id);
    if (!p) return;
    const updated = { ...p, [key]: !p[key] };
    try {
      await persist(updated);
      setProductList((prev) => prev.map((x) => x.id === id ? updated : x));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to save');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setProductList((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const saveEdit = async (updated: Product) => {
    try {
      await persist(updated);
      setProductList((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setEditing(null);
      toast.success('Product updated');
    } catch {
      toast.error('Failed to save product');
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Base Price', 'Sizes', 'Stock', 'Hidden', 'Best Seller', 'Featured'];
    const rows = productList.map((p) => [p.id, p.name, p.category, p.price, p.sizes.map((s) => `${s.name}:${s.price}`).join(' | '), p.stock, p.hidden, p.bestSeller, p.featured]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Products exported');
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{productList.length} products · {productList.filter((p) => !p.hidden).length} visible</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs uppercase tracking-wider transition-colors hover:bg-accent"><Download className="h-3.5 w-3.5" /> Export CSV</button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90"><Plus className="h-3.5 w-3.5" /> Add Product</button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground" />
      </div>

      <div className="grid gap-4">
        {filtered.map((p, i) => {
          const from = p.sizes.length > 0 ? Math.min(...p.sizes.map((s) => s.price)) : p.price;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]?.url ?? ''} alt={p.name} className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{categoryLabels[p.category] ?? p.category} · Stock: {p.stock}{p.comboItems?.length ? ` · ${p.comboItems.length} items` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">From {formatPrice(from)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setEditing(p)} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"><Pencil className="h-3 w-3" /> Edit</button>
                  <button onClick={() => toggleHidden(p.id)} className={cn('flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors', p.hidden ? 'border-warning text-warning' : 'border-border hover:bg-accent')}>{p.hidden ? <><EyeOff className="h-3 w-3" /> Hidden</> : <><Eye className="h-3 w-3" /> Visible</>}</button>
                  <button onClick={() => toggleFlag(p.id, 'saleEnabled')} className={cn('flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors', p.saleEnabled ? 'border-success text-success' : 'border-border hover:bg-accent')}><Tag className="h-3 w-3" /> {p.saleEnabled ? 'On Sale' : 'Sale'}</button>
                  <button onClick={() => toggleFlag(p.id, 'bestSeller')} className={cn('flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors', p.bestSeller ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-accent')}><Star className="h-3 w-3" /> Best Seller</button>
                  <button onClick={() => toggleFlag(p.id, 'featured')} className={cn('flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors', p.featured ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-accent')}>Featured</button>
                  <button onClick={() => deleteProduct(p.id)} className="flex items-center gap-1 rounded-md border border-destructive px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"><Trash2 className="h-3 w-3" /> Delete</button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {editing && <ProductEditorModal product={editing} onSave={saveEdit} onClose={() => setEditing(null)} allProducts={productList} />}
      {showAdd && <ProductEditorModal product={blankProduct()} isNew onSave={(p) => { setProductList((prev) => [p, ...prev]); setShowAdd(false); toast.success('Product created'); }} onClose={() => setShowAdd(false)} allProducts={productList} />}
    </div>
  );
}

function ProductEditorModal({ product, isNew, onSave, onClose, allProducts }: { product: Product; isNew?: boolean; onSave: (p: Product) => void; onClose: () => void; allProducts: Product[] }) {
  const [form, setForm] = useState<Product>({ ...product, sizes: product.sizes.map((s) => ({ ...s })), variants: product.variants.map((v) => ({ ...v, images: v.images.map((i) => ({ ...i })) })), comboItems: product.comboItems?.map((c) => ({ ...c })) });
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const update = (key: keyof Product, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const setSize = (i: number, field: keyof ProductSize, value: string | number) =>
    setForm((p) => ({ ...p, sizes: p.sizes.map((s, idx) => idx === i ? { ...s, [field]: field === 'name' ? String(value) : Number(value) } : s) }));

  const addSize = () => setForm((p) => ({ ...p, sizes: [...p.sizes, { name: '', price: p.price || 0 }] }));
  const removeSize = (i: number) => setForm((p) => ({ ...p, sizes: p.sizes.filter((_, idx) => idx !== i) }));

  const setVariant = (i: number, field: 'color' | 'colorHex', value: string) =>
    setForm((p) => ({ ...p, variants: p.variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v) }));

  const setVariantImage = (i: number, url: string) =>
    setForm((p) => ({ ...p, variants: p.variants.map((v, idx) => idx === i ? { ...v, images: url ? [{ url, alt: v.color }] : [] } : v) }));

  const handleUpload = async (i: number, file: File | null) => {
    if (!file) return;
    const MAX = 300 * 1024;
    if (file.size > MAX) { toast.error(`Image too large (${Math.round(file.size / 1024)}kb). Max 300kb.`); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Only JPG, PNG or WebP allowed.'); return; }
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? 'Upload failed'); return; }
      setVariantImage(i, json.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingIdx(null);
    }
  };

  const addVariant = () => setForm((p) => ({ ...p, variants: [...p.variants, { color: '', colorHex: '#888888', images: [] }] }));
  const removeVariant = (i: number) => setForm((p) => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }));

  const toggleComboItem = (candidate: Product) => {
    setForm((p) => {
      const existing = p.comboItems ?? [];
      const isIn = existing.some((c) => c.productId === candidate.id);
      const comboItems: ComboItem[] = isIn
        ? existing.filter((c) => c.productId !== candidate.id)
        : [...existing, { productId: candidate.id, name: candidate.name, image: candidate.images[0]?.url, quantity: 1 }];
      return { ...p, comboItems };
    });
  };

  const setComboQty = (productId: string, quantity: number) =>
    setForm((p) => ({ ...p, comboItems: (p.comboItems ?? []).map((c) => c.productId === productId ? { ...c, quantity } : c) }));

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const sizes = form.sizes.filter((s) => s.name.trim());
    if (sizes.length === 0) { toast.error('Add at least one size'); return; }
    const variants = form.variants.filter((v) => v.color.trim());
    if (variants.length === 0) { toast.error('Add at least one color'); return; }
    if (form.category === 'combos' && (form.comboItems?.length ?? 0) < 2) { toast.error('A combo needs at least 2 items'); return; }

    setSaving(true);
    try {
      const minPrice = Math.min(...sizes.map((s) => s.price));
      const slug = form.slug || slugify(form.name);
      const imageUrl = variants[0].images[0]?.url ?? 'https://images.pexels.com/photos/769733/pexels-photo-769733.jpeg?auto=compress&cs=tinysrgb&w=1200';
      const saved: Product = {
        ...form,
        slug,
        price: minPrice,
        sizes,
        variants: variants.map((v) => ({ ...v, images: v.images.length ? v.images : [{ url: imageUrl, alt: v.color }] })),
        images: form.images.length ? form.images : [{ url: imageUrl, alt: form.name }],
        comboItems: form.category === 'combos' ? (form.comboItems ?? []) : undefined,
        saleEndsAt: form.saleEnabled ? form.saleEndsAt ?? new Date(Date.now() + 30 * 86400000).toISOString() : undefined,
      };
      onSave(saved);
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground';
  const comboPool = allProducts.filter((p) => p.id !== form.id && p.category !== 'combos');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl">{isNew ? 'Add Product' : 'Edit Product'}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5">
          {/* Basics */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="eyebrow">Name *</label><input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass + ' mt-2'} /></div>
            <div><label className="eyebrow">Slug (auto if blank)</label><input value={form.slug} onChange={(e) => update('slug', e.target.value)} className={inputClass + ' mt-2'} /></div>
          </div>
          <div><label className="eyebrow">Tagline</label><input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="eyebrow">Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value as ProductCategory)} className={inputClass + ' mt-2'}>
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="eyebrow">Base Price (₹, auto)</label><input type="number" value={form.price} onChange={(e) => update('price', Number(e.target.value))} className={inputClass + ' mt-2'} /></div>
            <div><label className="eyebrow">Stock</label><input type="number" value={form.stock} onChange={(e) => update('stock', Number(e.target.value))} className={inputClass + ' mt-2'} /></div>
          </div>
          <div><label className="eyebrow">Description</label><textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className={inputClass + ' mt-2 resize-none'} /></div>

          {/* Per-size pricing */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Per-Size Pricing</p>
              <button onClick={addSize} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"><Plus className="h-3 w-3" /> Add Size</button>
            </div>
            <div className="mt-3 space-y-2">
              {form.sizes.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                  <input value={s.name} onChange={(e) => setSize(i, 'name', e.target.value)} placeholder="Size (S/M/L/28/Set)" className={inputClass} />
                  <input type="number" value={s.price} onChange={(e) => setSize(i, 'price', e.target.value)} placeholder="Price (₹)" className={inputClass} />
                  <input type="number" value={s.compareAtPrice ?? ''} onChange={(e) => setSize(i, 'compareAtPrice', e.target.value)} placeholder="Was (₹)" className={inputClass} />
                  <button onClick={() => removeSize(i)} className="rounded-md border border-destructive p-2 text-destructive transition-colors hover:bg-destructive/10" aria-label="Remove size"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Colors</p>
              <button onClick={addVariant} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"><Plus className="h-3 w-3" /> Add Color</button>
            </div>
            <div className="mt-3 space-y-2">
              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto_auto] items-center gap-2">
                  <input value={v.color} onChange={(e) => setVariant(i, 'color', e.target.value)} placeholder="Color name" className={inputClass} />
                  <input type="color" value={v.colorHex} onChange={(e) => setVariant(i, 'colorHex', e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background p-1" />
                  <input value={v.images[0]?.url ?? ''} onChange={(e) => setVariantImage(i, e.target.value)} placeholder="Image URL (optional)" className={inputClass} />
                  <label className="relative flex cursor-pointer items-center gap-1 rounded-md border border-border px-3 py-2 text-xs transition-colors hover:bg-accent">
                    {uploadingIdx === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                    {uploadingIdx === i ? 'Uploading' : 'Upload'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingIdx !== null} onChange={(e) => { handleUpload(i, e.target.files?.[0] ?? null); e.target.value = ''; }} />
                  </label>
                  <button onClick={() => removeVariant(i)} className="rounded-md border border-destructive p-2 text-destructive transition-colors hover:bg-destructive/10" aria-label="Remove color"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Combo contents */}
          {form.category === 'combos' && (
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <p className="eyebrow">Combo Items (pick 2+)</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {comboPool.map((candidate) => {
                  const isIn = (form.comboItems ?? []).some((c) => c.productId === candidate.id);
                  const qty = (form.comboItems ?? []).find((c) => c.productId === candidate.id)?.quantity ?? 1;
                  return (
                    <div key={candidate.id} className={cn('flex items-center gap-3 rounded-lg border p-3 transition-colors', isIn ? 'border-foreground bg-accent' : 'border-border')}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={candidate.images[0]?.url ?? ''} alt={candidate.name} className="h-12 w-10 flex-shrink-0 rounded-md object-cover" />
                      <button onClick={() => toggleComboItem(candidate)} className="flex-1 text-left text-sm">{candidate.name}</button>
                      {isIn && (
                        <input type="number" min={1} value={qty} onChange={(e) => setComboQty(candidate.id, Number(e.target.value))} className="w-16 rounded-md border border-border px-2 py-1 text-xs outline-none focus:border-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Flags */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.saleEnabled} onChange={(e) => update('saleEnabled', e.target.checked)} className="accent-foreground" /> Sale Enabled</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bestSeller} onChange={(e) => update('bestSeller', e.target.checked)} className="accent-foreground" /> Best Seller</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="accent-foreground" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.limitedEdition} onChange={(e) => update('limitedEdition', e.target.checked)} className="accent-foreground" /> Limited Edition</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isNew} onChange={(e) => update('isNew', e.target.checked)} className="accent-foreground" /> New Arrival</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.hidden} onChange={(e) => update('hidden', e.target.checked)} className="accent-foreground" /> Hidden</label>
          </div>

          <button onClick={save} disabled={saving} className="btn-lux w-full bg-foreground text-background disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
