'use client';

import Link from 'next/link';
import { useConfig } from '@/lib/use-config';
import { Instagram, Facebook, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';

const footerLinks = {
  Shop: [
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Best Sellers', href: '/shop?sort=bestselling' },
    { label: 'Limited Edition', href: '/shop?tag=limited' },
    { label: 'Summer Collection', href: '/shop?tag=summer' },
  ],
  'Story Line': [
    { label: 'Our Story', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/contact#faq' },
  ],
  'Client Care': [
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};

export function Footer() {
  const { config } = useConfig();
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container-lux py-16 md:py-24">
        <Reveal>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="font-display text-2xl tracking-[0.25em]">
                DEEV<span className="font-light">UH</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/60">
                A modern luxury atelier crafting limited-edition garments with uncompromising quality and timeless design.
              </p>
              <div className="mt-6 flex gap-3">
                <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:bg-background/10">
                  <Instagram className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:bg-background/10">
                  <Facebook className="h-4 w-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <p className="eyebrow text-background/50">{title}</p>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-background/70 transition-colors hover:text-background">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 text-xs text-background/50 md:flex-row">
          <p>&copy; {new Date().getFullYear()} DEEVUH. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Crafted with intention
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </footer>
  );
}
