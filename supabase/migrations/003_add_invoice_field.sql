-- Add invoice_sent and invoice_text fields to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_text TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_invoice_sent ON payments(invoice_sent) WHERE invoice_sent = FALSE;
