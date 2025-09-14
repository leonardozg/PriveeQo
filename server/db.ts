import ws from "ws";
import * as schema from "@shared/schema";
// Static imports for all required modules
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';

// Database configuration for multiple environments
let pool: any;
let db: any;

function initializeDatabase() {
  const { DATABASE_URL, PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT, NODE_ENV } = process.env;

  if (DATABASE_URL) {
    // Check if it's a Neon database URL
    if (DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('neon.dev')) {
      // Use Neon serverless driver for Neon databases
      neonConfig.webSocketConstructor = ws;
      pool = new NeonPool({ connectionString: DATABASE_URL });
      db = neonDrizzle({ client: pool, schema });
      
      console.log('🔗 Using Neon serverless database connection');
    } else {
      // Use standard node-postgres driver for other PostgreSQL providers
      pool = new PgPool({ 
        connectionString: DATABASE_URL,
        ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      db = pgDrizzle({ client: pool, schema });
      
      console.log('🔗 Using standard PostgreSQL connection via DATABASE_URL');
    }
  } else if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
    // Use individual PostgreSQL environment variables
    pool = new PgPool({
      host: PGHOST,
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
      port: PGPORT ? parseInt(PGPORT) : 5432,
      ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    db = pgDrizzle({ client: pool, schema });
    
    console.log('🔗 Using PostgreSQL connection via individual environment variables');
  } else {
    throw new Error(
      "Database configuration missing. Please provide either:\n" +
      "1. DATABASE_URL (for Neon or other PostgreSQL providers), or\n" +
      "2. Individual PostgreSQL variables: PGHOST, PGUSER, PGPASSWORD, PGDATABASE\n" +
      "Did you forget to provision a database?"
    );
  }
}

// Initialize database connection synchronously at startup
initializeDatabase();

// Export db and pool directly (now available immediately)
export { db, pool };