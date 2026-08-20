'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdmin } from '@/lib/admin-store';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const setAuthenticated = useAdmin((s) => s.setAuthenticated);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthenticated();
      toast.success('Welcome back');
      router.push('/admin');
      return;
    } catch {
      toast.error('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-background p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border">
              <Lock className="h-6 w-6" strokeWidth={1.5} />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="DEEVUH" className="mx-auto mt-4 h-10 w-auto" />
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Admin Access</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="eyebrow">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" placeholder="admin@deevuh.com" />
            </div>
            <div>
              <label className="eyebrow">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" placeholder="Enter admin password" />
            </div>
            <button type="submit" disabled={loading} className="btn-lux w-full bg-foreground text-background disabled:opacity-70">
              {loading ? 'Signing In...' : <>Sign In <ArrowRight className="h-3.5 w-3.5" /></>}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">Admin access via Supabase Auth</p>
        </div>
      </motion.div>
    </div>
  );
}
