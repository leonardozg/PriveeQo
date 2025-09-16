#!/usr/bin/env node
/**
 * Simple data insertion for Digital Ocean PostgreSQL
 * Run ONLY after tables are created with npm run db:push
 */

const { Client } = require('pg');
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

async function insertData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to Digital Ocean database');

    // 1. Create admin user
    const adminPassword = await hashPassword('Admin2025!');
    await client.query(`
      INSERT INTO admin_users (username, password) 
      VALUES ($1, $2) 
      ON CONFLICT (username) DO NOTHING
    `, ['admin', adminPassword]);
    console.log('✅ Admin user created: admin / Admin2025!');

    // 2. Check if items exist
    const itemCheck = await client.query('SELECT COUNT(*) FROM items');
    if (parseInt(itemCheck.rows[0].count) > 0) {
      console.log('ℹ️ Items already exist, skipping...');
      return;
    }

    // 3. Insert essential items
    const items = [
      ['Desayuno Club Plata', 'Enchiladas o chilaquiles con fruta, café y pan', 'Menú', '760.87', 15, 25, 'Plata', 'Club'],
      ['Mesa redonda Club Plata', 'Mesa con mantelería, sillas y vajilla', 'Mobiliario', '326.09', 15, 25, 'Plata', 'Club'],
      ['DJ Profesional Ceremonia', 'Audio profesional y DJ por 6 horas', 'Audio y Video', '153.64', 15, 20, 'Oro', 'Ceremonia'],
      ['Centro de mesa Gala', 'Arreglo floral premium', 'Decoración', '45.50', 15, 30, 'Platino', 'Gala']
    ];

    for (const item of items) {
      await client.query(`
        INSERT INTO items (name, description, category, base_price, min_margin, max_margin, quality, ambientacion, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      `, item);
    }
    console.log(`✅ ${items.length} essential items inserted`);

    // 4. Create sample partner
    const partnerPassword = await hashPassword('socio123');
    await client.query(`
      INSERT INTO partners (username, password, full_name, company, rfc, email, whatsapp, personal_address, assistant_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (username) DO NOTHING
    `, ['Alonso1', partnerPassword, 'Alonso Magos', 'Exp Log', 'MAAL850315ABC', 'alonso@explog.com', '+52 55 1234 5678', 'CDMX', 'María González']);
    console.log('✅ Sample partner created: Alonso1 / socio123');

    console.log('🎉 Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable required');
  process.exit(1);
}

insertData();