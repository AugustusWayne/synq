-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  customer TEXT NOT NULL,
  payer_wallet TEXT NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'payment_required')),
  current_period_end BIGINT NOT NULL,
  last_payment_tx TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant_id ON subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payer_wallet ON subscriptions(payer_wallet);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_plans_merchant_id ON plans(merchant_id);

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON plans FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON plans FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON subscriptions FOR UPDATE USING (true);

