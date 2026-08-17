'use client';

import { Sparkles, Truck, ShieldCheck } from 'lucide-react';

const items = [
  { icon: Truck, text: 'Complimentary express shipping over $250' },
  { icon: ShieldCheck, text: '30-day easy returns' },
  { icon: Sparkles, text: 'Hand-finished in small batches' },
  { icon: Truck, text: 'Carbon-neutral worldwide delivery' },
  { icon: ShieldCheck, text: 'Secure checkout verified' },
  { icon: Sparkles, text: 'Members earn early access to new drops' },
];

export function AnnouncementBar() {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-border/60 bg-foreground py-2.5 text-background">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]">
            <item.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
