import { SiteShell } from '@/components/site-shell';
import { PageHero } from '@/components/page-hero';
import { Reveal } from '@/components/reveal';

const stats = [
  { label: 'Return Window', value: '7 Days', note: 'from delivery date' },
  { label: 'Refund Method', value: 'Store Credit', note: 'valid for 1 year' },
  { label: 'Handling Fee', value: '₹150', note: 'deducted on return' },
];

const exchangeConditions = [
  'Exchange requests must be raised within 7 days of delivery.',
  'Products must be unused, unwashed, and in original condition with tags intact.',
  'Only one exchange is allowed per order/product.',
  'Exchange is subject to stock availability.',
];

const returnConditions = [
  'Return requests must be raised within 7 days of delivery.',
  'Products must be unused, unwashed, and in their original condition with tags intact.',
  'Once the returned product passes quality inspection, the refund amount will be issued as store credit after deducting ₹150 as delivery and handling charges.',
  'The store credit will remain valid for 1 year from the date of issue and can be used for future purchases on our website.',
  'Refunds will not be processed to bank accounts or original payment methods.',
];

const nonReturnable = [
  'Products purchased during sale or discount offers',
  'Customized or made-to-order items',
  'Accessories (if applicable)',
];

export default function RefundPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Legal" title="Return & Refund Policy" description="We want you to love what you ordered. Here's everything you need to know about returns, exchanges, and refunds." />

      <section className="container-lux max-w-4xl py-20 md:py-32">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-secondary/40 p-6 text-center">
                <p className="eyebrow">{s.label}</p>
                <p className="mt-2 font-display text-3xl md:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-16 space-y-14">
          <Reveal>
            <h2 className="font-display text-xl md:text-2xl">Exchange Policy</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">We offer a one-time size exchange subject to product availability.</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {exchangeConditions.map((c, i) => (
                <li key={i} className="flex gap-3"><span className="text-foreground">●</span>{c}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="font-display text-xl md:text-2xl">Return & Refund Conditions</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {returnConditions.map((c, i) => (
                <li key={i} className="flex gap-3"><span className="text-foreground">●</span>{c}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="font-display text-xl md:text-2xl">Non-Returnable Items</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The following items are not eligible for return or exchange:</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {nonReturnable.map((c, i) => (
                <li key={i} className="flex gap-3"><span className="text-foreground">●</span>{c}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="font-display text-xl md:text-2xl">Cancellation Policy</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Orders cannot be cancelled once the payment has been successfully completed.</p>
          </Reveal>

          <Reveal>
            <h2 className="font-display text-xl md:text-2xl">Need Help?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">For any queries regarding returns or exchanges, please reach out to us:</p>
            <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-6 text-sm">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="eyebrow">Website</p>
                  <p className="mt-1 font-medium">deevuh.in</p>
                </div>
                <div>
                  <p className="eyebrow">Email</p>
                  <p className="mt-1 font-medium">deevuhinfo@gmail.com</p>
                </div>
                <div>
                  <p className="eyebrow">Phone</p>
                  <p className="mt-1 font-medium">+91 78275 37480</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
