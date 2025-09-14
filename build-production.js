#!/usr/bin/env node

// Build script FINAL para DigitalOcean
// Frontend + Backend compilado - sin dependencias dev en runtime

import { execSync } from 'node:child_process';

console.log('🔨 Build completo para DigitalOcean...');

try {
  // Step 1: Build frontend
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Build backend SIMPLIFICADO  
  console.log('🚀 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --bundle --format=esm --outdir=dist --external:@neondatabase/serverless --external:drizzle-kit --external:sharp --external:lightningcss --external:@babel/* --external:postcss --external:autoprefixer --external:@tailwindcss/* --external:vite --external:@vitejs/* --external:@types/* --external:typescript', { stdio: 'inherit' });
  
  console.log('✅ Build completo - servidor compilado para node');
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}