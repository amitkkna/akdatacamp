-- ============================================
-- CAMPAIGN PROFITABILITY TRACKER - SINGLE ROW VIEW
-- Clear separation of Customer vs Vendor data in one table
-- ============================================

-- Drop old table if it exists (CAREFUL: This will delete existing data!)
DROP TABLE IF EXISTS campaign_invoices;
DROP TABLE IF EXISTS customer_invoices;
DROP TABLE IF EXISTS vendor_invoices;
DROP TABLE IF EXISTS campaigns;

-- Create the main campaign_invoices table with clear customer/vendor separation
CREATE TABLE IF NOT EXISTS campaign_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Campaign Information
    company TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,

    -- 💰 CUSTOMER INVOICE (Money Coming In)
    customer_invoice_number TEXT NOT NULL,
    customer_amount_without_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    customer_amount_with_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    customer_received_amount_without_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    customer_received_amount_with_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    customer_payment_status TEXT CHECK (customer_payment_status IN ('Clear', 'Pending', 'Partial')) NOT NULL DEFAULT 'Pending',
    customer_payment_date DATE,
    customer_remarks TEXT,

    -- 🏢 VENDOR EXPENSE (Money Going Out)
    vendor_name TEXT,
    vendor_invoice_number TEXT,
    vendor_amount_without_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    vendor_amount_with_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    vendor_paid_amount_without_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    vendor_paid_amount_with_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    vendor_payment_status TEXT CHECK (vendor_payment_status IN ('Clear', 'Pending', 'Partial')) NOT NULL DEFAULT 'Pending',
    vendor_payment_date DATE,
    vendor_remarks TEXT,

    -- 📊 CALCULATED PROFITABILITY
    profit DECIMAL(12,2) GENERATED ALWAYS AS (customer_received_amount_without_tax - vendor_paid_amount_without_tax) STORED,
    margin DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN customer_received_amount_without_tax > 0
            THEN ((customer_received_amount_without_tax - vendor_paid_amount_without_tax) / customer_received_amount_without_tax) * 100
            ELSE 0
        END
    ) STORED,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_invoices_company_campaign ON campaign_invoices(company, campaign_name);
CREATE INDEX IF NOT EXISTS idx_campaign_invoices_created_at ON campaign_invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_invoices_customer_payment ON campaign_invoices(customer_payment_status);
CREATE INDEX IF NOT EXISTS idx_campaign_invoices_vendor_payment ON campaign_invoices(vendor_payment_status);

-- Enable Row Level Security (RLS)
ALTER TABLE campaign_invoices ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations
CREATE POLICY "Allow all operations for all users" ON campaign_invoices
    FOR ALL USING (true);

-- Insert sample data with clear customer/vendor separation
INSERT INTO campaign_invoices (
    company,
    campaign_name,
    date_from,
    date_to,

    -- Customer Invoice Data (Money In)
    customer_invoice_number,
    customer_amount_without_tax,
    customer_amount_with_tax,
    customer_received_amount_without_tax,
    customer_received_amount_with_tax,
    customer_payment_status,
    customer_remarks,

    -- Vendor Expense Data (Money Out)
    vendor_name,
    vendor_invoice_number,
    vendor_amount_without_tax,
    vendor_amount_with_tax,
    vendor_paid_amount_without_tax,
    vendor_paid_amount_with_tax,
    vendor_payment_status,
    vendor_remarks
) VALUES (
    'Gmmco',
    '2 Billboard- MP',
    '2025-05-22',
    '2025-05-25',

    -- Customer data
    '23',
    5000.00,
    5900.00,
    5000.00,
    5900.00,
    'Clear',
    'HDFC 23052025',

    -- Vendor data
    'Billboard Vendor',
    'V001',
    3000.00,
    3540.00,
    3000.00,
    3540.00,
    'Clear',
    'Billboard installation'
);
