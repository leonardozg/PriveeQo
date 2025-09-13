#!/usr/bin/env node

// Simple production debug script to isolate the error 500 issue
console.log('🔍 PRODUCTION DEBUG SCRIPT STARTING...');

try {
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- REPLIT_DEPLOYMENT:', process.env.REPLIT_DEPLOYMENT);
  console.log('- DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('- PORT:', process.env.PORT);

  console.log('🔧 Attempting to load production server...');
  
  // Try to require the production build
  const serverPath = './dist/index.js';
  console.log('Loading from:', serverPath);
  
  import(serverPath).then(() => {
    console.log('✅ Production server loaded successfully');
  }).catch(error => {
    console.error('❌ PRODUCTION LOAD ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });

} catch (error) {
  console.error('🚨 CRITICAL ERROR:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}