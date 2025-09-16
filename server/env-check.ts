export function checkProductionEnvironment() {
  // FIXED: Support both NODE_ENV=production and REPLIT_DEPLOYMENT for platform compatibility
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
  
  console.log('Environment Check:');
  console.log('- REPLIT_DEPLOYMENT:', process.env.REPLIT_DEPLOYMENT);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('- Production mode:', isProduction);
  
  // FIXED: Accept either DATABASE_URL OR individual PG variables (Digital Ocean vs Replit)
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasIndividualPgVars = !!(process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE);
  const hasDatabaseConfig = hasDatabaseUrl || hasIndividualPgVars;
  
  const missing = [];
  if (!hasDatabaseConfig) {
    missing.push('DATABASE_URL or (PGHOST + PGUSER + PGPASSWORD + PGDATABASE)');
  }
  
  // Verificar variable de sesión
  if (!process.env.SESSION_SECRET) {
    console.warn('⚠️ SESSION_SECRET no configurado, usando valor por defecto');
  }
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing.join(', '));
  } else {
    console.log('✅ All critical environment variables present');
  }
  
  return {
    isProduction,
    hasRequiredEnvs: missing.length === 0,
    missingEnvs: missing
  };
}