'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Tag, Trash2, Plus, Truck, Percent, Phone, Mail, Link as LinkIcon, Loader2, Banknote } from 'lucide-react';
import { useConfig } from '@/lib/use-config';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { config: liveConfig, coupons: liveCoupons, refresh } = useConfig();
  const [config, setConfig] = useState(liveConfig);
  const [couponList, setCouponList] = useState(liveCoupons);
  const [saving, setSaving] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: 0, minSubtotal: 0, description: '' });

  const update = (path: string, value: any) => {
    setConfig((prev) => {
      const next = { ...prev };
      const parts = path.split('.');
      let obj: any = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved');
      refresh();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const saveCouponToApi = async (coupon: any) => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon),
    });
    if (!res.ok) throw new Error('Failed to save coupon');
  };

  const addCoupon = async () => {
    if (!newCoupon.code) { toast.error('Coupon code required'); return; }
    const coupon = { ...newCoupon, code: newCoupon.code.toUpperCase(), active: true };
    try {
      await saveCouponToApi(coupon);
      setCouponList((prev) => [...prev, coupon]);
      setNewCoupon({ code: '', type: 'percent', value: 0, minSubtotal: 0, description: '' });
      toast.success('Coupon created');
      refresh();
    } catch {
      toast.error('Failed to create coupon');
    }
  };

  const toggleCoupon = async (code: string) => {
    const c = couponList.find((c) => c.code === code);
    if (!c) return;
    try {
      await saveCouponToApi({ ...c, active: !c.active });
      setCouponList((prev) => prev.map((c) => c.code === code ? { ...c, active: !c.active } : c));
      toast.success('Coupon status updated');
      refresh();
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const deleteCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setCouponList((prev) => prev.filter((c) => c.code !== code));
      toast.success('Coupon deleted');
      refresh();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your store configuration</p>
      </div>

      {/* Shipping & Tax */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg"><Truck className="h-5 w-5" strokeWidth={1.5} /> Shipping & Tax</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="eyebrow">Free Shipping Threshold (₹)</label><input type="number" value={config.shipping.freeThreshold} onChange={(e) => update('shipping.freeThreshold', Number(e.target.value))} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Standard Charge (₹)</label><input type="number" value={config.shipping.standardCharge} onChange={(e) => update('shipping.standardCharge', Number(e.target.value))} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Express Charge (₹)</label><input type="number" value={config.shipping.expressCharge} onChange={(e) => update('shipping.expressCharge', Number(e.target.value))} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">GST Rate (%)</label><input type="number" value={config.tax.gstRate} onChange={(e) => update('tax.gstRate', Number(e.target.value))} className={inputClass + ' mt-2'} /></div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.tax.enabled} onChange={(e) => update('tax.enabled', e.target.checked)} className="accent-foreground" /> Enable GST</label>
          </div>
        </div>
      </section>

      {/* Cash on Delivery */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg"><Banknote className="h-5 w-5" strokeWidth={1.5} /> Cash on Delivery</h2>
        <p className="text-sm text-muted-foreground">COD is always enabled. Customers pay a fixed confirmation fee of <span className="font-medium text-foreground">₹149</span> online, and the remaining amount is collected on delivery.</p>
        <p className="mt-3 text-xs text-muted-foreground">Order total shown on the delivery bill = Grand Total − ₹149 (already paid online).</p>
      </section>

      {/* Contact Info */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg"><Phone className="h-5 w-5" strokeWidth={1.5} /> Contact Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="eyebrow">Email</label><input value={config.email} onChange={(e) => update('email', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Phone</label><input value={config.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">WhatsApp</label><input value={config.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Address</label><input value={config.address} onChange={(e) => update('address', e.target.value)} className={inputClass + ' mt-2'} /></div>
        </div>
      </section>

      {/* Social Links */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg"><LinkIcon className="h-5 w-5" strokeWidth={1.5} /> Social Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="eyebrow">Instagram</label><input value={config.social.instagram} onChange={(e) => update('social.instagram', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Facebook</label><input value={config.social.facebook} onChange={(e) => update('social.facebook', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Pinterest</label><input value={config.social.pinterest} onChange={(e) => update('social.pinterest', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">YouTube</label><input value={config.social.youtube} onChange={(e) => update('social.youtube', e.target.value)} className={inputClass + ' mt-2'} /></div>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 font-display text-lg">Hero Banner</h2>
        <div className="space-y-4">
          <div><label className="eyebrow">Headline</label><input value={config.hero.headline} onChange={(e) => update('hero.headline', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Subheadline</label><textarea value={config.hero.subheadline} onChange={(e) => update('hero.subheadline', e.target.value)} rows={2} className={inputClass + ' mt-2 resize-none'} /></div>
          <div><label className="eyebrow">Video URL</label><input value={config.hero.videoUrl} onChange={(e) => update('hero.videoUrl', e.target.value)} className={inputClass + ' mt-2'} /></div>
          <div><label className="eyebrow">Poster Image URL</label><input value={config.hero.poster} onChange={(e) => update('hero.poster', e.target.value)} className={inputClass + ' mt-2'} /></div>
        </div>
      </section>

      {/* Coupons */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg"><Tag className="h-5 w-5" strokeWidth={1.5} /> Coupon Codes</h2>
        <div className="space-y-3">
          {couponList.map((c) => (
            <div key={c.code} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{c.code}</p>
                <p className="text-xs text-muted-foreground">{c.description} · {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} off · Min ₹{c.minSubtotal}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleCoupon(c.code)} className={`rounded-md px-3 py-1.5 text-xs transition-colors ${c.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{c.active ? 'Active' : 'Inactive'}</button>
                <button onClick={() => deleteCoupon(c.code)} className="flex items-center justify-center rounded-md border border-destructive p-1.5 text-destructive transition-colors hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <p className="eyebrow mb-3">Create New Coupon</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} placeholder="Code" className={inputClass} />
            <select value={newCoupon.type} onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percent' | 'fixed' })} className={inputClass}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
            <input type="number" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })} placeholder="Value" className={inputClass} />
            <input type="number" value={newCoupon.minSubtotal} onChange={(e) => setNewCoupon({ ...newCoupon, minSubtotal: Number(e.target.value) })} placeholder="Min subtotal" className={inputClass} />
            <button onClick={addCoupon} className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs uppercase tracking-wider text-background"><Plus className="h-3.5 w-3.5" /> Add</button>
          </div>
        </div>
      </section>

      <button onClick={saveConfig} disabled={saving} className="btn-lux bg-foreground text-background disabled:opacity-70">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  );
}
