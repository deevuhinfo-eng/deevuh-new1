'use client';

import { Reveal } from '@/components/reveal';
import { useConfig } from '@/lib/use-config';
import { Instagram } from 'lucide-react';

const images = [
  'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/769733/pexels-photo-769733.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1652068/pexels-photo-1652068.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/8210485/pexels-photo-8210485.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export function InstagramGallery() {
  const { config } = useConfig();
  return (
    <section className="container-lux py-20 md:py-32">
      <Reveal className="mb-12 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Instagram className="h-4 w-4" strokeWidth={1.5} />
          <p className="eyebrow">@deevuh</p>
        </div>
        <h2 className="heading-2">Follow The Story Line</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Tag #Deevuh to be featured. Discover how our community styles our pieces.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {images.map((img, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <a
              href={config.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="zoom-container group relative block aspect-square overflow-hidden rounded-xl bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Instagram post ${i + 1}`} className="zoom-img h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Instagram className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
