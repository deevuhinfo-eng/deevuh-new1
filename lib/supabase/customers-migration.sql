-- ===== DEEVUH — Customer Accounts (Google Login) Migration =====
-- Run this in Supabase Dashboard → SQL Editor:
-- https://supabase.com/dashboard/project/asquzqghumidhdwfmrzv/sql/new

-- 1. Profiles (one row per customer, id = Supabase Auth user id)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Link orders to a customer (set when a logged-in user checks out)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- 3. SECURITY FIX:
-- Previously ANY authenticated user could read/update all rows via the broad
-- "Admin write *" and "Authenticated read *" policies. Admin operations run via
-- the service-role client which bypasses RLS, so these broad policies are not
-- needed and must be removed.
DROP POLICY IF EXISTS "Admin write products" ON products;
DROP POLICY IF EXISTS "Admin write orders" ON orders;
DROP POLICY IF EXISTS "Admin write coupons" ON coupons;
DROP POLICY IF EXISTS "Admin write reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated read order_items" ON order_items;

-- 4. Customer-scoped order reads (only your own orders)
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users read own order_items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o WHERE o.order_id = order_items.order_id AND o.customer_id = auth.uid()
  )
);

-- Keep public reads on catalog: products, coupons, reviews (already exist).
-- Keep "Anyone insert orders" / "Anyone insert order_items" (checkout flow).