// Create missing partners for authentication testing
import { db } from "./server/db.js";
import { partners } from "./shared/schema.js";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function createMissingPartners() {
  console.log('🚀 Creating missing partners...');
  
  const newPartners = [
    {
      username: 'Maria2',
      password: 'socio456',
      fullName: 'Maria Rodriguez',
      company: 'Eventos MR',
      rfc: 'XAXX010101001',
      email: 'maria@eventosmr.com',
      whatsapp: '+525551234568',
      personalAddress: 'Guadalajara, JAL',
      assistantName: 'Carlos López',
      isActive: true
    },
    {
      username: 'Carlos3',
      password: 'premium789',
      fullName: 'Carlos Mendoza',
      company: 'Premium Events',
      rfc: 'XAXX010101002',
      email: 'carlos@premiumevents.com',
      whatsapp: '+525551234569',
      personalAddress: 'Monterrey, NL',
      assistantName: 'Ana Torres',
      isActive: true
    }
  ];
  
  for (const partner of newPartners) {
    try {
      const hashedPassword = await hashPassword(partner.password);
      
      const result = await db.insert(partners).values({
        ...partner,
        password: hashedPassword,
        registrationDate: new Date()
      }).returning({ username: partners.username });
      
      console.log(`✅ Created partner: ${result[0].username}`);
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        console.log(`⚠️  Partner ${partner.username} already exists`);
      } else {
        console.error(`❌ Error creating ${partner.username}:`, error);
      }
    }
  }
  
  console.log('✅ Partner creation completed');
  process.exit(0);
}

createMissingPartners().catch(console.error);