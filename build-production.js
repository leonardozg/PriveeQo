#!/usr/bin/env node

// Build script FINAL para DigitalOcean
// Frontend + Backend compilado - sin dependencias dev en runtime

import { execSync } from 'node:child_process';

console.log('🔨 Build completo para DigitalOcean...');

try {
  // Step 1: Build frontend
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Build backend con TODAS las dependencies correctas
  console.log('🚀 Building backend...');
  const externals = [
    // Database y ORM
    '@neondatabase/serverless',
    'drizzle-orm',
    'ws',
    
    // Web framework y middleware  
    'express',
    'express-session',
    'multer',
    
    // Authentication
    'openid-client',
    'passport',
    'connect-pg-simple',
    
    // Utilities
    'zod',
    'csv-parse', 
    'nanoid',
    'memoizee',
    
    // Vite (solo en desarrollo)
    'vite',
    '@vitejs/*',
    
    // Babel (bundled dependencies)
    '@babel/*'
  ].map(pkg => `--external:${pkg}`).join(' ');
  
  execSync(`npx esbuild server/index.ts --platform=node --bundle --format=esm --outdir=dist --tree-shaking=true --minify=false --keep-names=true ${externals}`, { stdio: 'inherit' });
  
  console.log('✅ Build completo - servidor compilado para node');
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}