'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useConfig } from '@/lib/use-config';
import { ArrowRight, ArrowDown } from 'lucide-react';

export function Hero() {
  const { config } = useConfig();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const words = config.hero.headline.split(' ');

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={config.hero.poster}
          className="h-full w-full object-cover"
        >
          <source src={config.hero.videoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <motion.p
          className="mb-6 text-xs font-medium uppercase tracking-[0.4em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {config.tagline}
        </motion.p>

        <h1 className="heading-1 max-w-4xl text-balance">
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="mr-[0.25em] inline-block overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.12 }}
            >
              <motion.span
                className="inline-block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 md:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {config.hero.subheadline}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Link href="/shop" className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-black transition-all hover:gap-4">
            Explore Collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/about" className="rounded-full border border-white/40 px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors hover:bg-white/10">
            Our Story Line
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white"
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDown className="h-5 w-5" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </section>
  );
}
