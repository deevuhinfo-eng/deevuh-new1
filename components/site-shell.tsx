'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CursorGlow } from '@/components/cursor-glow';
import { PageLoader } from '@/components/page-loader';
import { BackToTop, MobileBottomNav, WhatsAppButton } from '@/components/floating-ui';
import { CartDrawer } from '@/components/cart-drawer';
import { WishlistDrawer } from '@/components/wishlist-drawer';
import { SearchOverlay } from '@/components/search-overlay';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <PageLoader />
      <CursorGlow />
      <Navbar />
      <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      <Footer />
      <BackToTop />
      <WhatsAppButton />
      <MobileBottomNav onCart={() => setCartOpen(true)} onWishlist={() => setWishlistOpen(true)} onSearch={() => setSearchOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
