// Fix partner passwords using correct storage format
import { db } from "./server/db.js";
import { partners } from "./shared/schema.js";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Use same format as DatabaseStorage class
async function hashPassword(password) {
  const salt = randomBytes(32).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

async function verifyPassword(password, hashedPassword) {
  try {
    const [key, salt] = hashedPassword.split('.');
    if (!key || !salt) {
      console.log('Invalid hash format');
      return false;
    }
    const derivedKey = await scryptAsync(password, salt, 64);
    return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch (error) {
    console.log('Verify error:', error.message);
    return false;
  }
}

async function fixPartnerPasswords() {
  console.log('Fixing Maria2 and Carlos3 passwords...');
  
  const partnersToFix = [
    { username: 'Maria2', password: 'socio456' },
    { username: 'Carlos3', password: 'premium789' }
  ];
  
  for (const partnerData of partnersToFix) {
    try {
      const hashedPassword = await hashPassword(partnerData.password);
      console.log(`Generated hash for ${partnerData.username}`);
      
      const result = await db.update(partners)
        .set({ password: hashedPassword })
        .where(eq(partners.username, partnerData.username))
        .returning({ username: partners.username });
      
      if (result.length > 0) {
        console.log(`Updated password for ${partnerData.username}`);
        
        // Test verification
        const isValid = await verifyPassword(partnerData.password, hashedPassword);
        console.log(`Verification test: ${isValid ? 'PASS' : 'FAIL'}`);
      } else {
        console.log(`Partner ${partnerData.username} not found`);
      }
    } catch (error) {
      console.error(`Error fixing ${partnerData.username}:`, error);
    }
  }
  
  console.log('Password fix completed');
  process.exit(0);
}

fixPartnerPasswords().catch(console.error);