'use client';

import { Sparkles, Truck } from 'lucide-react';
import { useConfig } from '@/lib/use-config';

export function AnnouncementBar() {
  const { config } = useConfig();
  const banner = config.freeShippingBanner;
  if (!banner) return null;
  const items = [
    { icon: Truck, text: banner },
    { icon: Sparkles, text: 'Hand-finished in small batches' },
  ];
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
