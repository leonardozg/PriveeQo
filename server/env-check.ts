export function checkProductionEnvironment() {
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  
  console.log('Environment Check:');
  console.log('- REPLIT_DEPLOYMENT:', process.env.REPLIT_DEPLOYMENT);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('- Production mode:', isProduction);
  
  // Verificar variables críticas
  const criticalEnvs = ['DATABASE_URL', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'];
  const missing = criticalEnvs.filter(env => !process.env[env]);
  
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