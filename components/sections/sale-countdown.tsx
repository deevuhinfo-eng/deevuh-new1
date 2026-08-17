'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/reveal';

function useCountdown(target: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

export function SaleCountdown() {
  const time = useCountdown('2026-12-31T23:59:59Z');
  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <section className="container-lux py-20 md:py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 px-6 py-16 text-center text-background md:px-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-radial from-background/10 to-transparent" />
          <div className="relative">
            <p className="eyebrow text-background/50">Limited Time</p>
            <h2 className="heading-2 mt-3">The End Of Season Sale</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-background/60">
              Up to 20% off selected pieces. Offer ends soon.
            </p>

            <div className="mt-10 flex justify-center gap-4 md:gap-8">
              {units.map((u, i) => (
                <motion.div
                  key={u.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-background/20 bg-background/5 font-display text-2xl md:h-20 md:w-20 md:text-3xl">
                    {String(u.value).padStart(2, '0')}
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-background/50">{u.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
