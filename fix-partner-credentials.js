// Fix partner credentials for testing authentication
import { db } from "./server/db.js";
import { partners } from "./shared/schema.js";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function fixPartnerCredentials() {
  console.log('🔧 Fixing partner credentials...');
  
  const partnerUpdates = [
    { username: 'Maria2', password: 'socio456' },
    { username: 'Carlos3', password: 'premium789' }
  ];
  
  for (const update of partnerUpdates) {
    try {
      const hashedPassword = await hashPassword(update.password);
      
      const result = await db.update(partners)
        .set({ password: hashedPassword })
        .where(eq(partners.username, update.username))
        .returning({ username: partners.username });
      
      if (result.length > 0) {
        console.log(`✅ Updated password for ${update.username}`);
      } else {
        console.log(`❌ Partner ${update.username} not found`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.username}:`, error);
    }
  }
  
  console.log('✅ Password update completed');
  process.exit(0);
}

fixPartnerCredentials().catch(console.error);