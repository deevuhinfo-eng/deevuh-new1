import { SiteShell } from '@/components/site-shell';
import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/reveal';
import { NewsletterSection } from '@/components/sections/newsletter';

const values = [
  { title: 'Our Story', body: 'Founded in 2019, DEEVUH began as a response to the noise of modern fashion. We believed luxury had lost its meaning in logo-chasing and seasonal churn. Our answer: a small atelier producing limited quantities of garments made to last decades, not seasons.' },
  { title: 'Our Mission', body: 'To create clothing that earns its place in your wardrobe through quality, not marketing. Every piece we make must be beautiful, durable, and responsibly produced. We measure success not in units sold, but in garments still worn ten years later.' },
  { title: 'Our Vision', body: 'A fashion industry that values craftsmanship over volume, sustainability over speed, and timeless design over trend. We envision a world where every garment is made with intention and worn with purpose.' },
  { title: 'Our Quality Promise', body: 'We work exclusively with mills in Italy, Scotland, Japan, and Portugal that hold certifications for responsible sourcing. Our wool is mulesing-free. Our cotton is GOTS-certified organic. Every seam is inspected by hand before it leaves our atelier.' },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Story Line" title="Crafted With Intention" description="A modern luxury house built on the belief that true luxury is quiet, considered, and built to last." />

      <section className="container-lux py-20 md:py-32">
        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal>
            <div className="zoom-container aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.pexels.com/photos/8210485/pexels-photo-8210485.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Atelier" className="zoom-img h-full w-full object-cover" />
            </div>
          </Reveal>
          <div className="space-y-12">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <p className="eyebrow">{v.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 md:py-32">
        <div className="container-lux">
          <Reveal className="text-center">
            <p className="eyebrow">By The Numbers</p>
            <h2 className="heading-2 mt-3">Our Commitment</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { num: '50+', label: 'Artisan Partners' },
              { num: '4', label: 'Countries of Origin' },
              { num: '100%', label: 'Responsible Sourcing' },
              { num: '0', label: 'Fast Fashion' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1} className="text-center">
                <p className="font-display text-4xl md:text-5xl">{stat.num}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSection />
    </SiteShell>
  );
}
