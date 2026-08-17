import { SiteShell } from '@/components/site-shell';
import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/reveal';

interface PolicySection {
  heading: string;
  body: string;
}

export function PolicyPage({ title, eyebrow, sections }: { title: string; eyebrow: string; sections: PolicySection[] }) {
  return (
    <SiteShell>
      <PageHero eyebrow={eyebrow} title={title} />
      <section className="container-lux max-w-3xl py-20 md:py-32">
        <div className="space-y-12">
          {sections.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <h2 className="font-display text-xl md:text-2xl">{s.heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
