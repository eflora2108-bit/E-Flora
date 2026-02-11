-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subtotal DECIMAL(10, 2) NOT NULL,
  cgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  igst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_gst DECIMAL(10, 2) NOT NULL,
  shipping_charges DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  pdf_url VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'generated',
  generated_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Add check constraint to ensure only one type of GST is used
ALTER TABLE invoices ADD CONSTRAINT check_gst_type
  CHECK (
    (cgst_amount > 0 AND sgst_amount > 0 AND igst_amount = 0) OR
    (cgst_amount = 0 AND sgst_amount = 0 AND igst_amount > 0) OR
    (cgst_amount = 0 AND sgst_amount = 0 AND igst_amount = 0)
  );

-- Add comment
COMMENT ON TABLE invoices IS 'GST-compliant invoices for orders';
