'use client';

import { motion } from 'framer-motion';
import { Reveal } from '@/components/reveal';

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="border-b border-border">
      <div className="container-lux py-16 md:py-24">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow">{eyebrow}</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="heading-1 mt-4 text-4xl md:text-6xl lg:text-7xl">{title}</motion.h1>
        {description && <Reveal delay={0.2}><p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p></Reveal>}
      </div>
    </div>
  );
}
