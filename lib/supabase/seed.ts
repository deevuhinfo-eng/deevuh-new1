import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { products } from '../products';
import { siteConfig, coupons, reviews } from '../config';
import { toRow } from './mappers';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '..', '..', '.env.local');
  if (!existsSync(envPath)) return;
  const env = Object.fromEntries(
    readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map((l) => l.split('='))
      .map(([k, ...v]) => [k.trim(), v.join('=').trim()])
  );
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log('Seeding products...');
  for (const p of products) {
    const { error } = await supabase.from('products').upsert(toRow(p), { onConflict: 'id' });
    if (error) console.error(`  Error seeding ${p.slug}:`, error.message);
    else console.log(`  ✓ ${p.slug}`);
  }

  console.log('Seeding site config...');
  const { error: configErr } = await supabase.from('site_config').upsert([
    { key: 'site', value: siteConfig as any },
  ], { onConflict: 'key' });
  if (configErr) console.error('  Error seeding site config:', configErr.message);
  else console.log('  ✓ site config');

  console.log('Seeding coupons...');
  for (const c of coupons) {
    const { error } = await supabase.from('coupons').upsert({
      code: c.code,
      type: c.type,
      value: c.value,
      min_subtotal: c.minSubtotal,
      active: c.active,
      expires_at: c.expiresAt ?? null,
      description: c.description,
    }, { onConflict: 'code' });
    if (error) console.error(`  Error seeding coupon ${c.code}:`, error.message);
    else console.log(`  ✓ ${c.code}`);
  }

  console.log('Seeding reviews...');
  for (const r of reviews) {
    const { error } = await supabase.from('reviews').upsert({
      id: r.id,
      name: r.name,
      location: r.location,
      rating: r.rating,
      title: r.title,
      body: r.body,
      product_id: r.productId ?? null,
      date: r.date,
      verified: r.verified,
    }, { onConflict: 'id' });
    if (error) console.error(`  Error seeding review ${r.id}:`, error.message);
    else console.log(`  ✓ ${r.id}`);
  }

  console.log('Done!');
}

seed().catch(console.error);
