#!/usr/bin/env node
/**
 * Manual Database Initialization for Digital Ocean
 * Run this script to set up admin user and products when auto-init fails
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Your Digital Ocean database URL
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// Schema definitions (minimal for manual init)
import { pgTable, varchar, text, integer, decimal, boolean, serial, index } from 'drizzle-orm/pg-core';

const adminUsers = pgTable('adminUsers', {
  id: varchar('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
});

const items = pgTable('items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  quality: varchar('quality', { length: 50 }).notNull(),
  ambientacion: varchar('ambientacion', { length: 50 }).notNull(),
  basePrice: decimal('basePrice', { precision: 10, scale: 2 }).notNull(),
  minMargin: integer('minMargin').notNull(),
  maxMargin: integer('maxMargin').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
});

const partners = pgTable('partners', {
  id: varchar('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('fullName', { length: 100 }).notNull(),
  company: varchar('company', { length: 100 }),
  rfc: varchar('rfc', { length: 20 }),
  email: varchar('email', { length: 100 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  personalAddress: text('personalAddress'),
  assistantName: varchar('assistantName', { length: 100 }),
});

async function hashPassword(password) {
  const salt = randomBytes(32).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function initializeDatabase() {
  try {
    console.log('🔄 Manual Database Initialization Starting...');

    // 1. Create admin user
    try {
      const adminPassword = await hashPassword('Admin2025!');
      await db.insert(adminUsers).values({
        id: generateId(),
        username: 'admin',
        password: adminPassword
      }).onConflictDoNothing();
      console.log('✅ Admin user created: admin / Admin2025!');
    } catch (error) {
      console.log('ℹ️ Admin user already exists or error:', error.message);
    }

    // 2. Check if products already exist
    try {
      const existingItems = await db.select().from(items).limit(1);
      if (existingItems.length > 0) {
        console.log('ℹ️ Products already loaded');
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not check existing items:', error.message);
    }

    // 3. Load essential products
    const productionItems = [
      {
        name: "Desayuno Club Plata",
        description: "Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano, Chocolate, Té, Pan mini dulce y salado",
        category: "Menú",
        quality: "Plata",
        ambientacion: "Club",
        basePrice: "760.87",
        minMargin: 15,
        maxMargin: 25,
        status: "active"
      },
      {
        name: "Desayuno Ceremonia Plata",
        description: "Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano, Chocolate, Té, Pan mini dulce y salado",
        category: "Menú",
        quality: "Plata",
        ambientacion: "Ceremonia",
        basePrice: "762.00",
        minMargin: 15,
        maxMargin: 25,
        status: "active"
      },
      {
        name: "Mesa redonda con mantelería Club Plata",
        description: "Mesa redonda con mantelería fina, Sillas plegables, Vajilla, cubiertos y cristalería, Plato base de diseño",
        category: "Mobiliario",
        quality: "Plata",
        ambientacion: "Club",
        basePrice: "326.09",
        minMargin: 15,
        maxMargin: 25,
        status: "active"
      },
      {
        name: "DJ Profesional Ceremonia Oro",
        description: "Sonorización con sistemas de audio Profesional hasta 130 personas, Servicio de DJ por 6 horas, Audio profesional HK, Mixer audio 12 canales, Micrófono SHURE, Cabina 6 modulos LED",
        category: "Audio y Video",
        quality: "Oro",
        ambientacion: "Ceremonia",
        basePrice: "153.64",
        minMargin: 15,
        maxMargin: 20,
        status: "active"
      }
    ];

    await db.insert(items).values(productionItems);
    console.log(`✅ ${productionItems.length} essential products loaded`);

    // 4. Create sample partner
    try {
      const partnerPassword = await hashPassword('socio123');
      await db.insert(partners).values({
        id: generateId(),
        username: 'Alonso1',
        password: partnerPassword,
        fullName: 'Alonso Magos',
        company: 'Exp Log',
        rfc: 'MAAL850315ABC',
        email: 'alonso@explog.com',
        whatsapp: '+52 55 1234 5678',
        personalAddress: 'CDMX',
        assistantName: 'María González'
      }).onConflictDoNothing();
      console.log('✅ Sample partner created: Alonso1 / socio123');
    } catch (error) {
      console.log('ℹ️ Partner already exists or error:', error.message);
    }

    console.log('🎉 Manual database initialization completed!');
    console.log('');
    console.log('Login credentials:');
    console.log('Admin: admin / Admin2025!');
    console.log('Partner: Alonso1 / socio123');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });