'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Chrome, LogOut, Package, User, Loader2, Save, MapPin, Phone, Mail } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface Order {
  order_id: string;
  txn_id: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  grand_total: number;
  placed_at: string;
  coupon_code: string | null;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const tab = searchParams.get('tab') === 'orders' ? 'orders' : 'profile';

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      setUser(session?.user ? { email: session.user.email || '' } : null);
      if (session?.user) {
        try {
          const [profRes, ordRes] = await Promise.all([
            fetch('/api/account/profile'),
            fetch('/api/account/orders'),
          ]);
          if (profRes.ok) {
            const j = await profRes.json();
            if (j.profile) {
              setProfile(j.profile);
              const f = { ...j.profile };
              delete f.id; delete f.email; delete f.avatar_url; delete f.created_at; delete f.updated_at;
              setForm(f);
            }
          }
          if (ordRes.ok) {
            const j = await ordRes.json();
            setOrders(j.orders || []);
            setItemsByOrder(j.itemsByOrder || {});
          }
        } catch {}
      }
      setLoading(false);
    }
    init();
    return () => { active = false; };
  }, []);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/account` },
      });
      if (error) throw error;
    } catch {
      setSigningIn(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('save failed');
      const j = await res.json();
      if (j.profile) setProfile(j.profile);
      window.alert('Profile updated');
    } catch {
      window.alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
    setOrders([]);
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground';

  return (
    <SiteShell>
      <div className="container-lux py-12 md:py-20">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="heading-2">My Account</motion.h1>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !user ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-10 max-w-md rounded-2xl border border-border p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <User className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 font-display text-2xl">Sign in to DEEVUH</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with Google to save your details, view orders and check out faster.
            </p>
            <button
              onClick={signInWithGoogle}
              disabled={signingIn}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-70"
            >
              {signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
              {signingIn ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>
            <p className="mt-4 text-xs text-muted-foreground">By continuing you agree to our Terms & Privacy Policy.</p>
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* Profile card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-8">
              <section className="rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl">Profile Details</h2>
                {profile?.avatar_url && (
                  <div className="mt-4 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.avatar_url} alt={profile.name} className="h-16 w-16 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                )}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div><label className="eyebrow">Full Name</label><input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass + ' mt-2'} /></div>
                  <div><label className="eyebrow">Phone</label><input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass + ' mt-2'} placeholder="+91..." /></div>
                  <div className="sm:col-span-2"><label className="eyebrow">Email</label><div className={inputClass + ' mt-2 bg-muted text-muted-foreground'}>{profile?.email}</div></div>
                  <div className="sm:col-span-2"><label className="eyebrow">Address</label><input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass + ' mt-2'} /></div>
                  <div><label className="eyebrow">City</label><input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass + ' mt-2'} /></div>
                  <div><label className="eyebrow">State</label><input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass + ' mt-2'} /></div>
                  <div><label className="eyebrow">Country</label><input value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass + ' mt-2'} /></div>
                  <div><label className="eyebrow">Pincode</label><input value={form.pincode || ''} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className={inputClass + ' mt-2'} /></div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="btn-lux mt-6 bg-foreground text-background disabled:opacity-70">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Profile
                </button>
              </section>

              {/* Orders */}
              <section className="rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl">Order History</h2>
                {orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1} />
                    <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
                    <Link href="/shop" className="btn-lux mt-6 inline-flex bg-foreground text-background">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {orders.map((o) => (
                      <div key={o.order_id} className="rounded-xl border border-border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-mono text-xs">{o.order_id}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(o.placed_at)} · {o.payment_method.toUpperCase()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(Number(o.grand_total))}</p>
                            <span className={cn('mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider', o.payment_status === 'paid' || o.payment_status === 'cod_confirmed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                              {o.payment_status === 'paid' || o.payment_status === 'cod_confirmed' ? 'Paid' : o.payment_status}
                            </span>
                          </div>
                        </div>
                        {(itemsByOrder[o.order_id] || []).length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                            {(itemsByOrder[o.order_id] || []).map((it, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                {it.image && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={it.image} alt={it.name} className="h-10 w-8 rounded object-cover" />
                                )}
                                <div className="flex-1">
                                  <p className="text-xs font-medium">{it.name}</p>
                                  <p className="text-xs text-muted-foreground">{it.color} · {it.size} · Qty {it.quantity}</p>
                                </div>
                                <p className="text-xs font-medium">{formatPrice(Number(it.price) * it.quantity)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-2xl border border-border p-6">
                <h3 className="eyebrow mb-4">Account</h3>
                <div className="space-y-1">
                  <Link href="/account" className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm', tab === 'profile' ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/50')}><User className="h-4 w-4" strokeWidth={1.5} /> Profile</Link>
                  <Link href="/account?tab=orders" className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm', tab === 'orders' ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/50')}><Package className="h-4 w-4" strokeWidth={1.5} /> My Orders {orders.length > 0 && <span className="ml-auto rounded-full bg-foreground px-2 py-0.5 text-[10px] text-background">{orders.length}</span>}</Link>
                </div>
                <button onClick={logout} className="mt-4 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" strokeWidth={1.5} /> Logout
                </button>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <h3 className="eyebrow mb-3">Contact</h3>
                <p className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> deevuhinfo@gmail.com</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> +91 78275 37480</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> deevuh.in</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}