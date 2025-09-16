-- PRIVEE Database Schema Setup for Digital Ocean PostgreSQL
-- This script creates all required tables and indexes for the PRIVEE application
-- 
-- Usage: psql "your-connection-string" -f schema-setup.sql
-- 
-- Generated: September 2025
-- Target: PostgreSQL 15+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Create sessions table for Express session storage
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index for session expiration cleanup
CREATE INDEX "IDX_session_expire" ON sessions (expire);

-- Create users table for Replit Auth integration
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin users table for system administration
CREATE TABLE admin_users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create partners table for business partners
CREATE TABLE partners (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company TEXT NOT NULL,
    rfc TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    whatsapp TEXT NOT NULL,
    personal_address TEXT NOT NULL,
    assistant_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    registration_date TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create items table for products/services catalog
CREATE TABLE items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Mobiliario', 'Menú', 'Decoración', 'Branding', 'Audio y Video', 'Espectáculos', 'Fotografía', 'Memorabilia')),
    base_price DECIMAL(10,2) NOT NULL,
    min_margin INTEGER NOT NULL,
    max_margin INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    quality TEXT NOT NULL CHECK (quality IN ('Plata', 'Oro', 'Platino')),
    ambientacion TEXT NOT NULL CHECK (ambientacion IN ('Conferencia', 'Club', 'Ceremonia', 'Gala')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create quotes table for client quotations
CREATE TABLE quotes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL UNIQUE,
    partner_id VARCHAR REFERENCES partners(id),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    project_name TEXT NOT NULL,
    event_date TEXT,
    partner_name TEXT NOT NULL,
    partner_email TEXT NOT NULL,
    partner_company TEXT NOT NULL,
    subtotal TEXT NOT NULL,
    total_margin TEXT NOT NULL,
    tax TEXT NOT NULL DEFAULT '0',
    total TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'executed', 'expired')),
    terms TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create quote_items table for individual items within quotes
CREATE TABLE quote_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id VARCHAR NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_id VARCHAR NOT NULL REFERENCES items(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    base_price TEXT NOT NULL,
    margin INTEGER NOT NULL,
    margin_amount TEXT NOT NULL,
    total_price TEXT NOT NULL
);

-- Create performance indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_admin_users_username ON admin_users (username);
CREATE INDEX idx_partners_username ON partners (username);
CREATE INDEX idx_partners_email ON partners (email);
CREATE INDEX idx_partners_active ON partners (is_active);

CREATE INDEX idx_items_category ON items (category);
CREATE INDEX idx_items_quality ON items (quality);
CREATE INDEX idx_items_ambientacion ON items (ambientacion);
CREATE INDEX idx_items_status ON items (status);
CREATE INDEX idx_items_category_quality ON items (category, quality);
CREATE INDEX idx_items_quality_ambientacion ON items (quality, ambientacion);

CREATE INDEX idx_quotes_partner_id ON quotes (partner_id);
CREATE INDEX idx_quotes_status ON quotes (status);
CREATE INDEX idx_quotes_created_at ON quotes (created_at);
CREATE INDEX idx_quotes_quote_number ON quotes (quote_number);

CREATE INDEX idx_quote_items_quote_id ON quote_items (quote_id);
CREATE INDEX idx_quote_items_item_id ON quote_items (item_id);

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Express session storage for user authentication';
COMMENT ON TABLE users IS 'User accounts for Replit Auth integration';
COMMENT ON TABLE admin_users IS 'Administrative users for system management';
COMMENT ON TABLE partners IS 'Business partners who can create quotes';
COMMENT ON TABLE items IS 'Product and service catalog with pricing and categorization';
COMMENT ON TABLE quotes IS 'Client quotations with pricing and status';
COMMENT ON TABLE quote_items IS 'Individual items within a quote with specific pricing';

-- Add column comments for key fields
COMMENT ON COLUMN items.category IS 'Product category: Mobiliario, Menú, Decoración, Branding, Audio y Video, Espectáculos, Fotografía, Memorabilia';
COMMENT ON COLUMN items.quality IS 'Service quality level: Plata, Oro, Platino';
COMMENT ON COLUMN items.ambientacion IS 'Event type: Conferencia, Club, Ceremonia, Gala';
COMMENT ON COLUMN items.min_margin IS 'Minimum margin percentage allowed';
COMMENT ON COLUMN items.max_margin IS 'Maximum margin percentage allowed';

COMMENT ON COLUMN quotes.status IS 'Quote status: draft, sent, accepted, rejected, executed, expired';
COMMENT ON COLUMN partners.is_active IS 'Whether the partner account is active and can create quotes';

-- Create a view for active items by category
CREATE VIEW active_items_by_category AS
SELECT 
    category,
    quality,
    ambientacion,
    COUNT(*) as item_count,
    AVG(base_price) as avg_price,
    MIN(base_price) as min_price,
    MAX(base_price) as max_price
FROM items 
WHERE status = 'active'
GROUP BY category, quality, ambientacion
ORDER BY category, quality, ambientacion;

-- Create a view for quote summaries
CREATE VIEW quote_summaries AS
SELECT 
    q.id,
    q.quote_number,
    q.client_name,
    q.project_name,
    q.status,
    q.total,
    q.created_at,
    p.full_name as partner_name,
    p.company as partner_company,
    COUNT(qi.id) as item_count
FROM quotes q
LEFT JOIN partners p ON q.partner_id = p.id
LEFT JOIN quote_items qi ON q.id = qi.quote_id
GROUP BY q.id, q.quote_number, q.client_name, q.project_name, q.status, q.total, q.created_at, p.full_name, p.company
ORDER BY q.created_at DESC;

-- Grant permissions (for additional users if needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Display creation summary
SELECT 'Tables created successfully' as status;
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Display index summary
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;