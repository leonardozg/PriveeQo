import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "../server/db.js";
import { eq } from "drizzle-orm";
import { partners } from "../shared/schema.js";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestPartner() {
  const hashedPassword = await hashPassword("socio123");
  
  try {
    // Delete existing partner if exists
    await db.delete(partners).where(eq(partners.username, "socio1"));
    
    // Create new partner
    const [partner] = await db
      .insert(partners)
      .values({
        username: "socio1",
        password: hashedPassword,
        fullName: "María González",
        company: "Eventos Especiales MG",
        rfc: "GONM850315A12",
        email: "maria@eventosespeciales.com",
        whatsapp: "+52 55 1234 5678",
        personalAddress: "Av. Reforma 123, CDMX",
        assistantName: "Ana López",
        isActive: true,
      })
      .returning();
    
    console.log("✓ Partner created successfully:");
    console.log(`  Username: socio1`);
    console.log(`  Password: socio123`);
    console.log(`  Name: ${partner.fullName}`);
    console.log(`  Company: ${partner.company}`);
  } catch (error) {
    console.error("Error creating partner:", error);
  }
}

createTestPartner().then(() => process.exit(0));