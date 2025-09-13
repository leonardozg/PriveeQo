#!/usr/bin/env node

// Build script específico para DigitalOcean
// Soluciona el problema ERR_MODULE_NOT_FOUND con vite

import { execSync } from 'node:child_process';

console.log('🔨 Iniciando build para DigitalOcean...');

try {
  // Step 1: Build frontend con Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Build backend con esbuild (sin --packages=external)
  console.log('🚀 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --bundle --format=esm --outdir=dist --external:drizzle-kit --external:@neondatabase/serverless', { stdio: 'inherit' });
  
  console.log('✅ Build completado exitosamente para DigitalOcean');
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}