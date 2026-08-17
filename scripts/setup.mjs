#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function main() {
  console.log('\n  MAISON NOIR — Supabase Setup\n');

  // Load env
  const envPath = join(root, '.env.local');
  if (!existsSync(envPath)) {
    console.log('  ❌ .env.local not found. Create it with:\n');
    console.log('  NEXT_PUBLIC_SUPABASE_URL=https://asquzqghumidhdwfmrzv.supabase.co');
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=sb_secret_...\n');
    process.exit(1);
  }

  const env = Object.fromEntries(
    readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map((l) => l.split('='))
      .map(([k, ...v]) => [k.trim(), v.join('=').trim()])
  );

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('  ❌ Missing Supabase keys in .env.local\n');
    process.exit(1);
  }

  console.log('  ✓ .env.local loaded');
  console.log('  ✓ URL:', env.NEXT_PUBLIC_SUPABASE_URL);

  // Test connection
  const testClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { error: testErr } = await testClient.from('products').select('id', { count: 'exact', head: true });

  if (testErr && testErr.message?.includes('does not exist')) {
    console.log('  ⚠ Tables not found. Run the migration SQL first.');
    console.log('\n  ─────────────────────────────────────────────');
    console.log('  1. Open: https://supabase.com/dashboard/project/asquzqghumidhdwfmrzv/sql/new');
    console.log('  2. Paste the content from lib/supabase/migration.sql');
    console.log('  3. Click "Run"');
    console.log('  4. Then run: node scripts/setup.mjs\n');
    process.exit(0);
  }

  console.log('  ✓ Tables exist!');

  // Seed data if service role key is available
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  ⚠ No SUPABASE_SERVICE_ROLE_KEY. Skipping seed.\n');
    console.log('  Setup complete! Run: npm run dev\n');
    process.exit(0);
  }

  const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Check if data exists
  const { count } = await adminClient.from('products').select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    console.log(`  ✓ ${count} products already seeded.`);
    console.log('\n  Setup complete! Run: npm run dev\n');
    process.exit(0);
  }

  // Seed
  console.log('  Seeding data...');

  const seedPath = join(root, 'lib', 'supabase', 'seed.ts');
  if (existsSync(seedPath)) {
    console.log('  ▶ Run: npx tsx lib/supabase/seed.ts\n');
  } else {
    console.log('  ⚠ seed.ts not found\n');
  }

  console.log('  Setup complete! Run: npm run dev\n');
}

main().catch(console.error);
