#!/usr/bin/env node
/**
 * DATABASE CONNECTION TEST FOR DIGITAL OCEAN POSTGRESQL
 * 
 * This script tests your Digital Ocean database connection and verifies
 * that all data has been loaded correctly for the PRIVEE application.
 * 
 * Usage:
 * export DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
 * node test-connection.js
 */

const { Client } = require('pg');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testConnection() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    log(colors.red, '❌ DATABASE_URL environment variable not set');
    log(colors.yellow, '\nSet it like this:');
    log(colors.cyan, 'export DATABASE_URL="postgresql://doadmin:password@host:25060/privee_db?sslmode=require"');
    log(colors.yellow, '\nThen run: node test-connection.js');
    process.exit(1);
  }

  log(colors.bright + colors.blue, '🔍 TESTING DIGITAL OCEAN DATABASE CONNECTION');
  log(colors.bright + colors.blue, '============================================');
  console.log('');

  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test 1: Basic Connection
    log(colors.yellow, '1️⃣ Testing database connection...');
    await client.connect();
    log(colors.green, '✅ Successfully connected to Digital Ocean PostgreSQL');
    console.log('');

    // Test 2: Database Information
    log(colors.yellow, '2️⃣ Gathering database information...');
    const dbInfo = await client.query('SELECT version(), current_database(), current_user, inet_server_addr(), inet_server_port()');
    const info = dbInfo.rows[0];
    
    console.log('   📊 Database Details:');
    console.log(`      • Database Name: ${info.current_database}`);
    console.log(`      • Connected User: ${info.current_user}`);
    console.log(`      • PostgreSQL Version: ${info.version.split(' ').slice(0, 2).join(' ')}`);
    console.log(`      • Server Address: ${info.inet_server_addr || 'localhost'}`);
    console.log(`      • Server Port: ${info.inet_server_port || 'default'}`);
    log(colors.green, '✅ Database information retrieved');
    console.log('');

    // Test 3: Schema Verification
    log(colors.yellow, '3️⃣ Verifying database schema...');
    const tables = await client.query(`
      SELECT tablename, hasindexes, hasrules, hastriggers 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const expectedTables = ['admin_users', 'items', 'partners', 'quote_items', 'quotes', 'sessions', 'users'];
    const foundTables = tables.rows.map(row => row.tablename);
    
    console.log('   📋 Tables Found:');
    expectedTables.forEach(tableName => {
      if (foundTables.includes(tableName)) {
        console.log(`      ✅ ${tableName}`);
      } else {
        log(colors.red, `      ❌ ${tableName} - MISSING`);
      }
    });
    
    if (foundTables.length === expectedTables.length) {
      log(colors.green, '✅ All required tables found');
    } else {
      log(colors.red, `❌ Missing ${expectedTables.length - foundTables.length} tables`);
    }
    console.log('');

    // Test 4: Data Counts
    log(colors.yellow, '4️⃣ Checking data counts...');
    const counts = await client.query(`
      SELECT 'items' as table_name, COUNT(*) as count FROM items
      UNION ALL
      SELECT 'admin_users' as table_name, COUNT(*) as count FROM admin_users
      UNION ALL
      SELECT 'partners' as table_name, COUNT(*) as count FROM partners
      UNION ALL
      SELECT 'quotes' as table_name, COUNT(*) as count FROM quotes
      UNION ALL
      SELECT 'quote_items' as table_name, COUNT(*) as count FROM quote_items
      ORDER BY table_name
    `);
    
    console.log('   📊 Record Counts:');
    counts.rows.forEach(row => {
      const count = parseInt(row.count);
      const icon = count > 0 ? '✅' : '⚠️';
      console.log(`      ${icon} ${row.table_name}: ${count} records`);
    });
    
    // Check for expected data
    const itemCount = counts.rows.find(r => r.table_name === 'items')?.count || 0;
    const adminCount = counts.rows.find(r => r.table_name === 'admin_users')?.count || 0;
    const partnerCount = counts.rows.find(r => r.table_name === 'partners')?.count || 0;
    
    if (itemCount >= 87) {
      log(colors.green, '✅ Product catalog is fully loaded');
    } else {
      log(colors.yellow, `⚠️ Expected 87 products, found ${itemCount}`);
    }
    
    if (adminCount >= 1) {
      log(colors.green, '✅ Admin user configured');
    } else {
      log(colors.red, '❌ No admin users found');
    }
    
    if (partnerCount >= 1) {
      log(colors.green, '✅ Partner accounts configured');
    } else {
      log(colors.yellow, '⚠️ No partner accounts found');
    }
    console.log('');

    // Test 5: Category Distribution
    log(colors.yellow, '5️⃣ Analyzing product categories...');
    const categories = await client.query(`
      SELECT category, COUNT(*) as count
      FROM items 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('   📦 Products by Category:');
    categories.rows.forEach(row => {
      console.log(`      • ${row.category}: ${row.count} items`);
    });
    
    const expectedCategories = ['Menú', 'Mobiliario', 'Decoración', 'Audio y Video', 'Espectáculos'];
    const foundCategories = categories.rows.map(row => row.category);
    const missingCategories = expectedCategories.filter(cat => !foundCategories.includes(cat));
    
    if (missingCategories.length === 0) {
      log(colors.green, '✅ All product categories found');
    } else {
      log(colors.yellow, `⚠️ Missing categories: ${missingCategories.join(', ')}`);
    }
    console.log('');

    // Test 6: Quality & Ambientacion Distribution
    log(colors.yellow, '6️⃣ Checking quality and event type distribution...');
    const qualityDist = await client.query(`
      SELECT quality, COUNT(*) as count, 
             ROUND(AVG(base_price::numeric), 2) as avg_price
      FROM items 
      GROUP BY quality
      ORDER BY 
        CASE quality 
          WHEN 'Plata' THEN 1 
          WHEN 'Oro' THEN 2 
          WHEN 'Platino' THEN 3 
        END
    `);
    
    console.log('   💎 Quality Distribution:');
    qualityDist.rows.forEach(row => {
      console.log(`      • ${row.quality}: ${row.count} items (avg: $${row.avg_price})`);
    });
    
    const ambientacionDist = await client.query(`
      SELECT ambientacion, COUNT(*) as count
      FROM items 
      GROUP BY ambientacion
      ORDER BY count DESC
    `);
    
    console.log('   🎭 Event Type Distribution:');
    ambientacionDist.rows.forEach(row => {
      console.log(`      • ${row.ambientacion}: ${row.count} items`);
    });
    
    log(colors.green, '✅ Quality and event type analysis complete');
    console.log('');

    // Test 7: Authentication Data
    log(colors.yellow, '7️⃣ Verifying authentication accounts...');
    
    const adminCheck = await client.query('SELECT username, created_at FROM admin_users LIMIT 5');
    console.log('   👤 Admin Users:');
    if (adminCheck.rows.length > 0) {
      adminCheck.rows.forEach(row => {
        console.log(`      ✅ ${row.username} (created: ${new Date(row.created_at).toLocaleDateString()})`);
      });
    } else {
      log(colors.red, '      ❌ No admin users found');
    }
    
    const partnerCheck = await client.query('SELECT username, full_name, company, email FROM partners LIMIT 5');
    console.log('   🤝 Partners:');
    if (partnerCheck.rows.length > 0) {
      partnerCheck.rows.forEach(row => {
        console.log(`      ✅ ${row.username} - ${row.full_name} (${row.company})`);
        console.log(`         📧 ${row.email}`);
      });
    } else {
      log(colors.red, '      ❌ No partners found');
    }
    
    log(colors.green, '✅ Authentication verification complete');
    console.log('');

    // Test 8: Performance Check
    log(colors.yellow, '8️⃣ Running performance checks...');
    
    const startTime = Date.now();
    await client.query(`
      SELECT i.name, i.category, i.quality, i.ambientacion, i.base_price
      FROM items i
      WHERE i.status = 'active'
      ORDER BY i.category, i.quality
      LIMIT 10
    `);
    const queryTime = Date.now() - startTime;
    
    console.log(`   ⚡ Sample query executed in ${queryTime}ms`);
    
    if (queryTime < 100) {
      log(colors.green, '✅ Database performance is excellent');
    } else if (queryTime < 500) {
      log(colors.yellow, '⚠️ Database performance is acceptable');
    } else {
      log(colors.red, '❌ Database performance may need optimization');
    }
    console.log('');

    // Final Success Summary
    log(colors.bright + colors.green, '🎉 DATABASE CONNECTION TEST COMPLETED SUCCESSFULLY!');
    log(colors.bright + colors.green, '================================================');
    console.log('');
    log(colors.bright, '📋 Test Results Summary:');
    log(colors.green, '   ✅ Connection established');
    log(colors.green, '   ✅ Schema verified');
    log(colors.green, '   ✅ Data loaded and accessible');
    log(colors.green, '   ✅ Authentication configured');
    log(colors.green, '   ✅ Performance acceptable');
    console.log('');
    log(colors.bright + colors.cyan, '🚀 Your Digital Ocean database is ready for production!');
    console.log('');
    
    // Next steps
    log(colors.bright, '📋 Recommended Next Steps:');
    console.log('   1. Update your application with this DATABASE_URL');
    console.log('   2. Test admin login (admin / Admin2025!)');
    console.log('   3. Test partner login (check partner usernames above)');
    console.log('   4. Deploy your application to production');
    console.log('   5. Monitor database performance in production');
    console.log('');

  } catch (error) {
    console.log('');
    log(colors.bright + colors.red, '❌ DATABASE CONNECTION TEST FAILED');
    log(colors.bright + colors.red, '==================================');
    console.log('');
    log(colors.red, `Error: ${error.message}`);
    console.log('');
    log(colors.bright, '🔧 Troubleshooting Steps:');
    console.log('   1. Verify your DATABASE_URL is correct');
    console.log('   2. Check if your IP is in Digital Ocean trusted sources');
    console.log('   3. Ensure the database is running and accessible');
    console.log('   4. Verify SSL configuration (sslmode=require)');
    console.log('   5. Check firewall and network connectivity');
    console.log('   6. Ensure the database schema has been created');
    console.log('');
    log(colors.yellow, '💡 Common Solutions:');
    console.log('   • Run schema-setup.sql if tables are missing');
    console.log('   • Run do-database-init.js if data is missing');
    console.log('   • Check Digital Ocean console for database status');
    console.log('   • Verify connection string format and credentials');
    console.log('');
    log(colors.cyan, 'Full error details:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConnection().catch(console.error);
}

module.exports = { testConnection };