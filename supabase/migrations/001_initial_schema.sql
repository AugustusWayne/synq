-- Create merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL UNIQUE,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  payer TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  timestamp BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_merchants_wallet ON merchants(wallet);

-- Enable Row Level Security
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON payments FOR INSERT WITH CHECK (true);

