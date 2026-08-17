'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviews } from '@/lib/config';
import { Reveal } from '@/components/reveal';

export function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => { setDirection(1); setIndex((p) => (p + 1) % reviews.length); }, 5000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir: number) => { setDirection(dir); setIndex((p) => (p + dir + reviews.length) % reviews.length); };
  const review = reviews[index];

  return (
    <section className="bg-secondary py-20 md:py-32">
      <div className="container-lux">
        <Reveal className="mb-12 text-center">
          <p className="eyebrow">Client Testimonials</p>
          <h2 className="heading-2 mt-3">Words From Our Clients</h2>
        </Reveal>

        <div className="relative mx-auto max-w-3xl">
          <Quote className="mx-auto mb-8 h-10 w-10 text-foreground/20" strokeWidth={1} />
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="mb-4 flex justify-center gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                ))}
              </div>
              <p className="font-display text-2xl leading-snug md:text-3xl">{review.title}</p>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              <div className="mt-8">
                <p className="text-sm font-medium">{review.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{review.location}</p>
                {review.verified && <p className="mt-2 text-xs text-success">Verified Purchase</p>}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} aria-label="Previous" className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-foreground' : 'w-1.5 bg-foreground/30'}`} aria-label={`Go to review ${i + 1}`} />
              ))}
            </div>
            <button onClick={() => go(1)} aria-label="Next" className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
