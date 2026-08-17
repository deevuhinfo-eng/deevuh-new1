'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, Home, Search, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, cartCount } from '@/lib/store';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg md:bottom-6 md:right-6"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function MobileBottomNav({ onCart, onWishlist, onSearch }: { onCart: () => void; onWishlist: () => void; onSearch: () => void }) {
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const count = cartCount(cart);
  const [active, setActive] = useState('home');

  const items = [
    { id: 'home', icon: Home, label: 'Home', action: () => (window.location.href = '/') },
    { id: 'search', icon: Search, label: 'Search', action: onSearch },
    { id: 'wishlist', icon: Heart, label: 'Saved', badge: wishlist.length, action: onWishlist },
    { id: 'cart', icon: ShoppingBag, label: 'Bag', badge: count, action: onCart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[90] flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => { setActive(item.id); item.action(); }}
          className={cn('relative flex flex-col items-center gap-1 py-3 px-6 text-[10px] font-medium uppercase tracking-wider transition-colors', active === item.id ? 'text-foreground' : 'text-muted-foreground')}
        >
          <item.icon className="h-5 w-5" strokeWidth={1.5} />
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute right-3 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-medium text-background">{item.badge}</span>
          )}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/12125550148"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 md:bottom-6 md:left-6"
      aria-label="WhatsApp"
    >
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  );
}
