// Fix password hashing issue for Maria2 and Carlos3
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

async function verifyPassword(password, hash) {
  try {
    const [salt, derivedKey] = hash.split(':');
    if (!salt || !derivedKey) {
      console.log('❌ Invalid hash format:', hash);
      return false;
    }
    
    const key = await scryptAsync(password, salt, 64);
    return key.toString('hex') === derivedKey;
  } catch (error) {
    console.log('❌ Verify error:', error.message);
    return false;
  }
}

async function fixPasswordHashing() {
  console.log('🔧 Fixing password hashing for Maria2 and Carlos3...');
  
  const partnersToFix = [
    { username: 'Maria2', password: 'socio456' },
    { username: 'Carlos3', password: 'premium789' }
  ];
  
  for (const partnerData of partnersToFix) {
    try {
      // Generate properly hashed password
      const hashedPassword = await hashPassword(partnerData.password);
      console.log(\`🔐 Generated hash for \${partnerData.username}: \${hashedPassword.substring(0, 20)}...\`);
      
      // Update in database
      const result = await db.update(partners)
        .set({ password: hashedPassword })
        .where(eq(partners.username, partnerData.username))
        .returning({ username: partners.username, password: partners.password });
      
      if (result.length > 0) {
        console.log(\`✅ Updated password for \${partnerData.username}\`);
        
        // Verify the hash works
        const isValid = await verifyPassword(partnerData.password, hashedPassword);
        console.log(\`✅ Password verification test: \${isValid ? 'PASS' : 'FAIL'}\`);
      } else {
        console.log(\`❌ Partner \${partnerData.username} not found in database\`);
      }
      
    } catch (error) {
      console.error(\`❌ Error fixing \${partnerData.username}:\`, error);
    }
    console.log('');
  }
  
  console.log('✅ Password fixing completed');
  process.exit(0);
}

fixPasswordHashing().catch(console.error);