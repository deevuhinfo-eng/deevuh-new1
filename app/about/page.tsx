import { SiteShell } from '@/components/site-shell';
import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/reveal';
import { NewsletterSection } from '@/components/sections/newsletter';

const values = [
  { title: 'Our Story', body: 'From Two Best Friends, With Love. Deevuh was born from a shared love for fashion and a dream to create something meaningful together.' },
  { title: 'Proudly Made In India', body: 'Every piece is crafted with care by talented artisans and karigars who bring our designs to life. Behind every stitch is craftsmanship, passion, and countless hours of dedication.' },
  { title: 'Our Philosophy', body: 'We\u2019re not here to chase trends. We don\u2019t want to create clothes that just live in your wardrobe. We want to create pieces you reach for when you want to feel like the best version of yourself.' },
  { title: 'Our Thank You', body: 'From two best friends to every girl who chooses Deevuh \u2014 thank you for being part of this dream. This is more than fashion for us. It\u2019s our heart, our story, and everything we love stitched into every piece. \u2661' },
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
              <img src="/banners/about.jpg" alt="Deevuh" className="zoom-img h-full w-full object-cover" />
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
              { num: '100%', label: 'Made In India' },
              { num: '2', label: 'Best Friends, One Dream' },
              { num: 'Small', label: 'Batch Productions' },
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
