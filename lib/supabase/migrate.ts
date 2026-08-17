import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log('Running migration...');
  const sql = readFileSync(join(__dirname, 'migration.sql'), 'utf-8');

  // Try using pg (requires direct DB connection)
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      host: `db.${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}.supabase.co`,
      port: 6543,
      database: 'postgres',
      user: 'postgres',
      password: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });
    await pool.query(sql);
    await pool.end();
    console.log('Migration completed via direct DB connection!');
    return;
  } catch (e: any) {
    console.log('Direct DB connection failed:', e.message);
    console.log('Trying Supabase REST API...');
  }

  // Try via Supabase REST API (management endpoint)
  try {
    const url = `https://api.supabase.com/v1/projects/${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}/sql`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) {
      console.log('Migration completed via Management API!');
      return;
    }
    const err = await res.text();
    console.log('Management API failed:', err);
  } catch (e: any) {
    console.log('Management API error:', e.message);
  }

  console.log('\n❌ Could not run migration automatically.');
  console.log('Please go to: https://supabase.com/dashboard/project/asquzqghumidhdwfmrzv/sql/new');
  console.log('Paste the content of lib/supabase/migration.sql and click Run.');
  console.log('Then run: npx tsx lib/supabase/seed.ts');
  process.exit(1);
}

run().catch(console.error);
