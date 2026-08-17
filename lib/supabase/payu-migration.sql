-- PayU Payment Gateway Migration
-- Run this in Supabase Dashboard → SQL Editor: https://supabase.com/dashboard/project/asquzqghumidhdwfmrzv/sql/new

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pg_txn_id TEXT,
  ADD COLUMN IF NOT EXISTS pg_status TEXT,
  ADD COLUMN IF NOT EXISTS pg_error TEXT;
