'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Package, User, Loader2, Save, MapPin, Phone, Mail, KeyRound, ArrowRight } from 'lucide-react';
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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [isResetMode, setIsResetMode] = useState(searchParams.get('reset') === '1');

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

  const handleEmailAuth = async () => {
    setAuthError('');
    setAuthNotice('');
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter your email and password.');
      return;
    }
    setSigningIn(true);
    try {
      const supabase = createClient();
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { full_name: authName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Faccount`,
          },
        });
        if (error) throw error;
        if (data.session) {
          setUser({ email: authEmail.trim() });
          try {
            const profRes = await fetch('/api/account/profile');
            if (profRes.ok) {
              const j = await profRes.json();
              if (j.profile) setProfile(j.profile);
            }
          } catch {}
          const next = searchParams.get('next');
          if (next) {
            window.location.href = next;
            return;
          }
        } else {
          setAuthNotice('Account created! We sent a confirmation link to your email. Please click it to verify and sign in.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('not confirmed')) {
            setAuthError('Email not confirmed yet. Check your inbox for the confirmation link, or create a new account to resend it.');
          } else {
            setAuthError(error.message);
          }
          return;
        }
        setUser({ email: authEmail.trim() });
        setProfile(null);
        try {
          const profRes = await fetch('/api/account/profile');
          if (profRes.ok) {
            const j = await profRes.json();
            if (j.profile) setProfile(j.profile);
          }
        } catch {}
        try {
          const ordRes = await fetch('/api/account/orders');
          if (ordRes.ok) {
            const j = await ordRes.json();
            setOrders(j.orders || []);
            setItemsByOrder(j.itemsByOrder || {});
          }
        } catch {}
        const next = searchParams.get('next');
        if (next) {
          window.location.href = next;
          return;
        }
      }
    } catch (e: any) {
      setAuthError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const sendResetLink = async () => {
    setAuthError('');
    setAuthNotice('');
    if (!resetEmail.trim()) {
      setAuthError('Please enter your email.');
      return;
    }
    setResetting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Faccount%3Freset%3D1`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (e: any) {
      setAuthError(e.message || 'Failed to send reset link. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const completePasswordReset = async () => {
    setAuthError('');
    setAuthNotice('');
    if (!resetPassword || resetPassword.length < 8) {
      setAuthError('Password must be at least 8 characters.');
      return;
    }
    if (resetPassword !== resetConfirm) {
      setAuthError('Passwords do not match.');
      return;
    }
    setResetting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: resetPassword });
      if (error) throw error;
      setAuthNotice('Password updated successfully! You can now sign in.');
      setIsResetMode(false);
      setAuthPassword(resetPassword);
      setAuthMode('login');
      setResetPassword('');
      setResetConfirm('');
    } catch (e: any) {
      setAuthError(e.message || 'Failed to update password. Please try again.');
    } finally {
      setResetting(false);
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
          isResetMode ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-10 max-w-md rounded-2xl border border-border p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                <KeyRound className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="mt-4 font-display text-2xl">Reset Password</h2>
              <p className="mt-2 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a link to reset your password.</p>
              {authError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{authError}</p>}
              {resetSent ? (
                <div className="mt-6">
                  <p className="flex items-center justify-center gap-2 text-sm text-success"><Mail className="h-4 w-4" /> Reset link sent! Check your inbox.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4 text-left">
                  <div>
                    <label className="eyebrow">Email</label>
                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className={inputClass + ' mt-2'} placeholder="you@example.com" />
                  </div>
                  <button onClick={sendResetLink} disabled={resetting} className="btn-lux w-full bg-foreground text-background disabled:opacity-70">
                    {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send Reset Link
                  </button>
                  <button onClick={() => { setIsResetMode(false); setResetEmail(''); setAuthError(''); }} className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground">Back to Sign In</button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-10 max-w-md rounded-2xl border border-border p-8">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <User className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h2 className="mt-4 font-display text-2xl">{authMode === 'signup' ? 'Create Account' : 'Sign in to DEEVUH'}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {authMode === 'signup' ? 'Join to save your details, view orders and check out faster.' : 'Sign in to save your details, view orders and check out faster.'}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 rounded-lg border border-border p-1 text-sm">
                <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`rounded-md py-2 font-medium transition-colors ${authMode === 'login' ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'}`}>Sign In</button>
                <button onClick={() => { setAuthMode('signup'); setAuthError(''); }} className={`rounded-md py-2 font-medium transition-colors ${authMode === 'signup' ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'}`}>Sign Up</button>
              </div>

              <div className="mt-4 space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="eyebrow">Full Name</label>
                    <input value={authName} onChange={(e) => setAuthName(e.target.value)} className={inputClass + ' mt-2'} placeholder="Your name" />
                  </div>
                )}
                <div>
                  <label className="eyebrow">Email</label>
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className={inputClass + ' mt-2'} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="eyebrow">Password</label>
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className={inputClass + ' mt-2'} placeholder={authMode === 'signup' ? 'At least 8 characters' : 'Your password'} onKeyDown={(e) => { if (e.key === 'Enter') handleEmailAuth(); }} />
                </div>
              </div>

              {authMode === 'login' && (
                <button onClick={() => { setIsResetMode(true); setAuthError(''); }} className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground">Forgot password?</button>
              )}

              {authError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{authError}</p>}
              {authNotice && <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{authNotice}</p>}

              <button onClick={handleEmailAuth} disabled={signingIn} className="btn-lux mt-5 w-full bg-foreground text-background disabled:opacity-70">
                {signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {signingIn ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
              <p className="mt-4 text-center text-xs text-muted-foreground">By continuing you agree to our Terms & Privacy Policy.</p>
            </motion.div>
          )
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
        ) : user && isResetMode ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-10 max-w-md rounded-2xl border border-border p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <KeyRound className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 font-display text-2xl">Set New Password</h2>
            <p className="mt-2 text-sm text-muted-foreground">Choose a new password for your account.</p>
            {authError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{authError}</p>}
            {authNotice && <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{authNotice}</p>}
            <div className="mt-6 space-y-4 text-left">
              <div>
                <label className="eyebrow">New Password</label>
                <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className={inputClass + ' mt-2'} placeholder="At least 8 characters" />
              </div>
              <div>
                <label className="eyebrow">Confirm Password</label>
                <input type="password" value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} className={inputClass + ' mt-2'} placeholder="Re-enter new password" onKeyDown={(e) => { if (e.key === 'Enter') completePasswordReset(); }} />
              </div>
              <button onClick={completePasswordReset} disabled={resetting} className="btn-lux w-full bg-foreground text-background disabled:opacity-70">
                {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update Password
              </button>
            </div>
          </motion.div>
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