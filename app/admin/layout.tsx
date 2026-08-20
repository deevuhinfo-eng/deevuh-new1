'use client';

import { useAdmin } from '@/lib/admin-store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Menu, X, ExternalLink, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdmin((s) => s.isAuthenticated);
  const setAuthenticated = useAdmin((s) => s.setAuthenticated);
  const logout = useAdmin((s) => s.logout);
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useAdmin.persist.hasHydrated());
    const unsub = useAdmin.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    async function checkAuth() {
      if (pathname === '/admin/login') { setAuthChecked(true); return; }

      // Check Supabase session
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const res = await fetch('/api/admin/check');
          const json = await res.json();
          if (json.admin) { setAuthenticated(); setAuthChecked(true); return; }
        }
      } catch {}

      // No Supabase session — redirect to login instead of relying on local state
      router.push('/admin/login');
      setAuthChecked(true);
    }
    checkAuth();
  }, [hydrated, isAuthenticated, pathname, router, setAuthenticated]);

  if (!hydrated || !authChecked) return <div className="min-h-screen bg-background" />;
  if (pathname === '/admin/login') return <>{children}</>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transition-transform lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/admin" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="DEEVUH" className="h-7 w-auto" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors', active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent')}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent">
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} /> View Storefront
          </Link>
          <button onClick={() => { logout(); router.push('/admin/login'); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-destructive transition-colors hover:bg-accent">
            <LogOut className="h-4 w-4" strokeWidth={1.5} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="h-5 w-5" /></button>
          <p className="hidden text-xs uppercase tracking-wider text-muted-foreground lg:block">Admin Dashboard</p>
          <ThemeToggle />
        </header>
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
