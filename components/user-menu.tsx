'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Package, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string; avatar: string } | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (session?.user) {
        const meta = (session.user.user_metadata || {}) as Record<string, any>;
        setUser({
          email: session.user.email || '',
          name: meta.full_name || meta.name || session.user.email?.split('@')[0] || '',
          avatar: meta.avatar_url || meta.picture || meta.avatar || '',
        });
      } else {
        setUser(null);
      }
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => sync());
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => {
      active = false;
      sub.subscription.unsubscribe();
      document.removeEventListener('mousedown', onDocClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    setOpen(false);
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <Link
        href="/account"
        aria-label="Sign in"
        className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <User className="h-4 w-4" strokeWidth={1.5} />
        <span className="hidden md:inline">Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="flex h-9 items-center gap-1.5 rounded-full transition-colors hover:bg-accent"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold uppercase text-background">
            {user.name.charAt(0)}
          </span>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[200] mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-accent">
            <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> My Account
          </Link>
          <Link href="/account?tab=orders" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-accent">
            <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> My Orders
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-destructive transition-colors hover:bg-accent">
            <LogOut className="h-4 w-4" strokeWidth={1.5} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}