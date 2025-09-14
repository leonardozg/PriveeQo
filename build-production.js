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
  
  // Node.js core modules - explicitly externalize
  const nodeBuiltins = [
    'node:fs', 'node:path', 'node:url', 'node:crypto', 'node:util', 'node:child_process',
    'node:stream', 'node:events', 'node:os', 'node:buffer', 'node:process',
    'fs', 'path', 'url', 'crypto', 'util', 'child_process',
    'stream', 'events', 'os', 'buffer', 'process', 'http', 'https'
  ];
  
  const externals = [
    // Node.js core modules
    ...nodeBuiltins,
    
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
  
  // Enhanced esbuild configuration for Node.js compatibility
  const esbuildCmd = `npx esbuild server/index.ts ` +
    `--platform=node ` +
    `--target=node22 ` +
    `--bundle ` +
    `--format=esm ` +
    `--outdir=dist ` +
    `--tree-shaking=true ` +
    `--minify=false ` +
    `--keep-names=true ` +
    `--sourcemap=external ` +
    `--main-fields=main,module ` +
    `--conditions=node ` +
    `${externals}`;
    
  console.log('📝 Building with enhanced Node.js polyfill support...');
  execSync(esbuildCmd, { stdio: 'inherit' });
  
  console.log('✅ Build completo - servidor compilado para node');
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}