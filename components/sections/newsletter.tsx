'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success('Welcome to DEEVUH. Check your inbox.');
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-background md:py-32">
      <div className="absolute inset-0 bg-gradient-radial from-background/10 via-transparent to-transparent" />
      <div className="container-lux relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-background/50">Join The List</p>
          <h2 className="heading-2 mt-3">Become A Deevuh Insider</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-background/60">
            Be the first to access new drops, private sales, and atelier stories. Enjoy 10% off your first order.
          </p>

          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-full border border-background/20 bg-background/5 px-6 py-4 text-sm text-background placeholder:text-background/40 outline-none focus:border-background/40"
            />
            <button type="submit" className="group flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-all hover:gap-3">
              {submitted ? <><Check className="h-4 w-4" /> Subscribed</> : <>Subscribe <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>
          <p className="mt-4 text-xs text-background/40">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
        </Reveal>
      </div>
    </section>
  );
}
