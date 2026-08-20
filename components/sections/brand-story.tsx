'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';

export function BrandStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[400px] overflow-hidden lg:min-h-[600px]">
          <motion.div style={{ y }} className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/banners/story-line.jpg"
              alt="The Story Line"
              className="h-[120%] w-full object-cover"
            />
          </motion.div>
        </div>

        <div className="flex items-center bg-secondary px-6 py-20 md:px-16 md:py-32">
          <Reveal>
            <p className="eyebrow">The Story Line</p>
            <h2 className="heading-2 mt-4">Crafted With Intention, Worn For Decades</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                DEEVUH was founded on a single belief: that true luxury is quiet. No loud logos, no seasonal churn. Just garments made to last, from materials sourced at the world&rsquo;s finest mills.
              </p>
              <p>
                Every piece is designed in-house and produced in small batches by artisans who have spent decades perfecting their craft. We work with mills in Italy, Scotland, and Japan that share our commitment to responsible sourcing and uncompromising quality.
              </p>
              <p>
                This is clothing designed to be worn, loved, and passed on. Not discarded.
              </p>
            </div>
            <Link href="/about" className="group mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] transition-all hover:gap-3">
              Discover Our Story <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
