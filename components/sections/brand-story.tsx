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
            <h2 className="heading-2 mt-4">From Two Best Friends, With Love.</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Deevuh was born from a shared love for fashion and a dream to create something meaningful together.
              </p>
              <p>
                Proudly made in India, every piece is crafted with care by talented artisans and karigars who bring our designs to life. Behind every stitch is craftsmanship, passion, and countless hours of dedication.
              </p>
              <p>
                We&rsquo;re not here to chase trends. We don&rsquo;t want to create clothes that live in your wardrobe. We want to create pieces you reach for when you want to feel like the best version of yourself.
              </p>
              <p>
                From two best friends to every girl who chooses Deevuh &mdash; thank you for being part of this dream.
              </p>
              <p>
                This is more than fashion for us. It&rsquo;s our heart, our story, and everything we love stitched into every piece. &hearts;
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
