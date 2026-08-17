import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { products } from '../lib/products';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(process.cwd(), '.env.local');
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

const keepIds = new Set(products.map((p) => p.id));

async function cleanup() {
  const { data, error } = await supabase.from('products').select('id, slug');
  if (error) throw error;

  const stale = (data ?? []).filter((row) => !keepIds.has(row.id));
  console.log(`Found ${stale.length} products to delete out of ${data?.length ?? 0} total.`);

  for (const row of stale) {
    const { error: delErr } = await supabase.from('products').delete().eq('id', row.id);
    if (delErr) console.error(`  ✗ ${row.id} (${row.slug}):`, delErr.message);
    else console.log(`  ✓ deleted ${row.id} (${row.slug})`);
  }

  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Done. ${count} products remain in DB.`);
}

cleanup().catch(console.error);
