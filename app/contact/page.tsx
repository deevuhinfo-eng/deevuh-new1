'use client';

import { SiteShell } from '@/components/site-shell';
import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/reveal';
import { faqs } from '@/lib/config';
import { useConfig } from '@/lib/use-config';
import { Mail, Phone, MapPin, MessageCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ContactPage() {
  const { config } = useConfig();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in all fields'); return; }
    toast.success('Message sent. We\'ll respond within 24 hours.');
    setForm({ name: '', email: '', message: '' });
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground';

  return (
    <SiteShell>
      <PageHero eyebrow="Get In Touch" title="Contact Us" description="Our concierge team is here to help with sizing, orders, and anything else you need." />

      <section className="container-lux py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-3">
          <Reveal className="space-y-8">
            <div>
              <Mail className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <p className="eyebrow mt-3">Email</p>
              <a href={`mailto:${config.email}`} className="mt-1 block text-sm transition-colors hover:text-muted-foreground">{config.email}</a>
            </div>
            <div>
              <Phone className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <p className="eyebrow mt-3">Phone</p>
              <a href={`tel:${config.phone}`} className="mt-1 block text-sm transition-colors hover:text-muted-foreground">{config.phone}</a>
            </div>
            <div>
              <MapPin className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <p className="eyebrow mt-3">Story Line</p>
              <p className="mt-1 text-sm text-muted-foreground">{config.address}</p>
            </div>
            <div className="flex gap-3">
              <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={`mailto:${config.email}`} className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-accent">
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <form onSubmit={submit} className="rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-display text-xl">Send Us A Message</h2>
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="eyebrow">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass + ' mt-2'} placeholder="Your name" /></div>
                  <div><label className="eyebrow">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass + ' mt-2'} placeholder="Your email" /></div>
                </div>
                <div><label className="eyebrow">Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className={inputClass + ' mt-2 resize-none'} placeholder="How can we help?" /></div>
                <button type="submit" className="btn-lux bg-foreground text-background">Send Message</button>
              </div>
            </form>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.123!2d-73.999!3d40.721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQzJzE1LjYiTiA3M8KwNTknNTYuNCJX!5e0!3m2!1sen!2sus!4v1234567890" width="100%" height="300" style={{ border: 0 }} loading="lazy" title="Story Line location" />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="bg-secondary py-20 md:py-32">
        <div className="container-lux max-w-3xl">
          <Reveal className="mb-12 text-center">
            <p className="eyebrow">FAQ</p>
            <h2 className="heading-2 mt-3">Frequently Asked Questions</h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-border bg-background overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between p-5 text-left">
                    <span className="text-sm font-medium">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
