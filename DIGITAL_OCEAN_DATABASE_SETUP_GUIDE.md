# Digital Ocean PostgreSQL Setup Guide for PRIVEE Application

## Overview
This guide provides complete step-by-step instructions for setting up a PostgreSQL database on Digital Ocean for the PRIVEE event management application. The database will be populated with 87 products, user authentication, and complete schema.

## Table of Contents
1. [Digital Ocean Database Creation](#1-digital-ocean-database-creation)
2. [Database Schema Setup](#2-database-schema-setup)  
3. [Data Population](#3-data-population)
4. [Verification & Testing](#4-verification--testing)
5. [Environment Configuration](#5-environment-configuration)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Digital Ocean Database Creation

### Step 1.1: Create Database Cluster

1. **Login to Digital Ocean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Navigate to **Databases** in the left sidebar

2. **Create New Database**
   - Click **"Create Database Cluster"**
   - **Database Engine**: PostgreSQL
   - **Version**: 15.x (recommended) or latest stable
   - **Datacenter Region**: Choose closest to your users
   - **VPC Network**: Create new VPC or use existing
   - **Database Cluster Configuration**:
     - **Basic**: 1GB RAM, 1vCPU, 10GB SSD (minimum for development)
     - **Production**: 2GB+ RAM, 2+ vCPU, 25GB+ SSD

3. **Database Settings**
   - **Cluster Name**: `privee-production-db` (or your preferred name)
   - **Database Name**: `privee_db`
   - **User**: `doadmin` (auto-created)
   - **Password**: Auto-generated (save this!)

4. **Security Settings**
   - **Trusted Sources**: 
     - Add your deployment server IP
     - Add your local development IP (for setup)
     - Add your application server IP range
   - **Enable SSL**: Yes (required for security)

### Step 1.2: Get Connection Details

After creation (takes 5-10 minutes), you'll get:

```
Host: your-cluster-name-do-user-numbers.b.db.ondigitalocean.com
Port: 25060
Database: privee_db
Username: doadmin
Password: [auto-generated]
SSL Mode: require
```

**Connection String Format:**
```
postgresql://doadmin:[password]@[host]:25060/privee_db?sslmode=require
```

**Example:**
```
postgresql://doadmin:xyz123@privee-db-do-user-12345-0.b.db.ondigitalocean.com:25060/privee_db?sslmode=require
```

---

## 2. Database Schema Setup

### Step 2.1: Connect to Database

**Option A: Using psql (Command Line)**
```bash
# Install PostgreSQL client if not installed
sudo apt-get install postgresql-client

# Connect to your database
psql "postgresql://doadmin:[password]@[host]:25060/privee_db?sslmode=require"
```

**Option B: Using GUI Tool**
- **pgAdmin**: Download from pgadmin.org
- **DBeaver**: Free universal database tool
- **DataGrip**: JetBrains IDE

### Step 2.2: Create Database Schema

Run the SQL script `schema-setup.sql` (provided in this package):

```bash
# Download and run the schema file
psql "postgresql://doadmin:[password]@[host]:25060/privee_db?sslmode=require" -f schema-setup.sql
```

**Manual Schema Creation:**
If you prefer to run commands manually, execute the following SQL commands:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create sessions table for authentication
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX "IDX_session_expire" ON sessions (expire);

-- Create users table for Replit Auth
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE admin_users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create partners table
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

-- Create items table
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

-- Create quotes table
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

-- Create quote_items table
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

-- Create indexes for better performance
CREATE INDEX idx_items_category ON items (category);
CREATE INDEX idx_items_quality ON items (quality);
CREATE INDEX idx_items_ambientacion ON items (ambientacion);
CREATE INDEX idx_quotes_partner_id ON quotes (partner_id);
CREATE INDEX idx_quotes_status ON quotes (status);
CREATE INDEX idx_quote_items_quote_id ON quote_items (quote_id);
CREATE INDEX idx_quote_items_item_id ON quote_items (item_id);
```

---

## 3. Data Population

### Step 3.1: Environment Variables Setup

Before running the automated data loading script, you must set up the required environment variables for security:

```bash
# Required: Database connection string
export DATABASE_URL="postgresql://doadmin:[password]@[host]:25060/privee_db?sslmode=require"

# Required: Secure admin credentials (choose strong passwords)
export ADMIN_PASSWORD="your_secure_admin_password_here"
export PARTNER_PASSWORD="your_secure_partner_password_here"

# Optional: Customize admin username (defaults to 'admin')
export ADMIN_USERNAME="admin"

# Optional: Customize partner details (defaults provided)
export PARTNER_USERNAME="Alonso1"
export PARTNER_FULL_NAME="Alonso Magos"
export PARTNER_COMPANY="Exp Log"
export PARTNER_RFC="MAAL850315ABC"
export PARTNER_EMAIL="alonso@explog.com"
export PARTNER_WHATSAPP="+52 55 1234 5678"
export PARTNER_ADDRESS="CDMX"
export PARTNER_ASSISTANT="María González"
```

**Security Requirements:**
- `ADMIN_PASSWORD`: Must be at least 8 characters, include letters, numbers, and symbols
- `PARTNER_PASSWORD`: Must be at least 6 characters minimum
- Never use default or weak passwords in production

### Step 3.2: Automated Data Loading

After setting environment variables, use the provided Node.js script `do-database-init.js`:

```bash
# Run the initialization script
node do-database-init.js
```

This script will automatically:
- ✅ Create admin user with your secure credentials
- ✅ Load 87 products across all categories
- ✅ Create sample partner with your secure credentials  
- ✅ Verify data integrity
- ✅ Display connection and authentication status

### Step 3.3: Manual Data Loading

If you prefer manual control, follow these steps:

**1. Create Admin User:**
```sql
-- IMPORTANT: Hash password using Node.js scrypt method that matches server implementation
-- Use the same password from your ADMIN_PASSWORD environment variable
INSERT INTO admin_users (username, password) 
VALUES ('admin', '[scrypt_hashed_password]')
ON CONFLICT (username) DO NOTHING;
```

**2. Load Products:**
```sql
-- Run the provided products-data.sql file
\i products-data.sql
```

**3. Create Sample Partner:**
```sql
-- IMPORTANT: Hash password using Node.js scrypt method that matches server implementation  
-- Use the same password from your PARTNER_PASSWORD environment variable
INSERT INTO partners (username, password, full_name, company, rfc, email, whatsapp, personal_address, assistant_name)
VALUES ('Alonso1', '[scrypt_hashed_password]', 'Alonso Magos', 'Exp Log', 'MAAL850315ABC', 'alonso@explog.com', '+52 55 1234 5678', 'CDMX', 'María González')
ON CONFLICT (username) DO NOTHING;
```

**⚠️ Important:** If doing manual setup, you must hash passwords using the same scrypt method that the server uses. The automated script (`do-database-init.js`) is recommended as it handles password hashing correctly.

---

## 4. Verification & Testing

### Step 4.1: Data Verification

```sql
-- Check table counts
SELECT 'items' as table_name, COUNT(*) as count FROM items
UNION ALL
SELECT 'admin_users' as table_name, COUNT(*) as count FROM admin_users
UNION ALL
SELECT 'partners' as table_name, COUNT(*) as count FROM partners;

-- Expected results:
-- items: 87
-- admin_users: 1  
-- partners: 1
```

### Step 4.2: Category Breakdown

```sql
-- Verify product categories
SELECT category, quality, ambientacion, COUNT(*) as count
FROM items 
GROUP BY category, quality, ambientacion
ORDER BY category, quality, ambientacion;
```

### Step 4.3: Authentication Test

```sql
-- Verify admin user exists
SELECT username, created_at FROM admin_users WHERE username = 'admin';

-- Verify partner exists
SELECT username, full_name, company FROM partners WHERE username = 'Alonso1';
```

### Step 4.4: Connection Test

Create a simple test script `test-connection.js`:

```javascript
const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to Digital Ocean database');
    
    const result = await client.query('SELECT COUNT(*) FROM items');
    console.log(`✅ Found ${result.rows[0].count} products`);
    
    const adminCheck = await client.query('SELECT username FROM admin_users LIMIT 1');
    console.log(`✅ Admin user: ${adminCheck.rows[0]?.username || 'NOT FOUND'}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
```

---

## 5. Environment Configuration

### Step 5.1: Production Environment Variables

```bash
# Required environment variables for your application
DATABASE_URL="postgresql://doadmin:[password]@[host]:25060/privee_db?sslmode=require"
NODE_ENV="production"
SESSION_SECRET="[generate-strong-secret]"
PORT="3000"
```

### Step 5.2: Security Configuration

1. **SSL Configuration**
   - Always use `sslmode=require` in production
   - Download SSL certificate if required by your hosting platform

2. **Connection Pooling**
   ```javascript
   // In your application
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false },
     max: 20, // max number of clients
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

3. **Backup Configuration**
   - Digital Ocean provides automatic daily backups
   - Consider additional backup strategy for critical data

---

## 6. Troubleshooting

### Common Issues & Solutions

**Issue: Connection Timeout**
```
Error: connect ETIMEDOUT
```
**Solution:**
- Check if your IP is added to trusted sources
- Verify firewall settings
- Ensure correct host and port

**Issue: SSL Error**
```
Error: self signed certificate
```
**Solution:**
```javascript
// Add to connection config
ssl: { rejectUnauthorized: false }
```

**Issue: Authentication Failed**
```
Error: password authentication failed
```
**Solution:**
- Double-check username and password
- Ensure you're using the correct database name
- Try regenerating database password in Digital Ocean panel

**Issue: Table Does Not Exist**
```
Error: relation "items" does not exist
```
**Solution:**
- Run the schema setup SQL first
- Check if you're connected to the correct database
- Verify table names match exactly (case-sensitive)

**Issue: Permission Denied**
```
Error: permission denied for table
```
**Solution:**
- Use the `doadmin` user for all operations
- Ensure proper grants are in place
- Check database user permissions

### Performance Optimization

**Slow Queries:**
```sql
-- Enable query logging
SHOW log_statement;

-- Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

**Index Usage:**
```sql
-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## Success Criteria

✅ **Database Created**: PostgreSQL cluster running on Digital Ocean  
✅ **Schema Deployed**: All 8 tables created with proper constraints  
✅ **Data Loaded**: 87 products, admin user, sample partner  
✅ **Authentication**: Admin and partner login working  
✅ **Connection**: Application successfully connects to database  
✅ **Performance**: Queries execute within acceptable timeframes  
✅ **Security**: SSL enabled, trusted sources configured  

---

## Next Steps

1. **Deploy Application**: Update your application with the new DATABASE_URL
2. **Monitor Performance**: Set up database monitoring and alerts
3. **Backup Strategy**: Configure additional backups if needed
4. **Scaling**: Monitor usage and scale database resources as needed
5. **Maintenance**: Schedule regular database maintenance windows

---

## Support Files

This guide includes the following additional files:
- `schema-setup.sql` - Complete database schema
- `do-database-init.js` - Automated data loading script
- `products-data.sql` - Product catalog SQL
- `test-connection.js` - Connection testing script
- `db-verification.sql` - Data verification queries

For additional support, consult:
- [Digital Ocean Database Documentation](https://docs.digitalocean.com/products/databases/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- PRIVEE Application Documentation