'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, X } from 'lucide-react';
import { useStore, cartCount } from '@/lib/store';
import { categoryLabels, products } from '@/lib/products';
import { ThemeToggle } from '@/components/theme-toggle';
import { CartDrawer } from '@/components/cart-drawer';
import { WishlistDrawer } from '@/components/wishlist-drawer';
import { SearchOverlay } from '@/components/search-overlay';
import { UserMenu } from '@/components/user-menu';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/shop', label: 'Shop All' },
  { href: '/shop?category=coordsets', label: 'Co-ord Sets' },
  { href: '/shop?category=bottomwear', label: 'Bottom Wear' },
  { href: '/about', label: 'Story Line' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const count = cartCount(cart);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header className={cn('sticky top-0 z-[100] transition-all duration-500', scrolled ? 'glass-strong shadow-sm' : 'bg-transparent')}>
        <div className="container-lux flex h-16 items-center justify-between md:h-20">
          <div className="flex items-center gap-6">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Link href="/" className="font-display text-xl tracking-[0.25em] md:text-2xl">
              DEEV<span className="font-light">UH</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn('link-underline text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:text-foreground', pathname === link.href ? 'text-foreground' : 'text-muted-foreground')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent">
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <ThemeToggle />
            <UserMenu />
            <button onClick={() => setWishlistOpen(true)} aria-label="Wishlist" className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent">
              <Heart className="h-4 w-4" strokeWidth={1.5} />
              {wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">{wishlist.length}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[150] bg-background md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <span className="font-display text-lg tracking-[0.25em]">DEEV<span className="font-light">UH</span></span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-6 py-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  <Link href={link.href} className="block border-b border-border/50 py-4 font-display text-2xl">
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
