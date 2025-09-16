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
  
  // Node.js core modules - explicitly externalize (comprehensive list)
  const nodeBuiltins = [
    'node:fs', 'node:path', 'node:url', 'node:crypto', 'node:util', 'node:child_process',
    'node:stream', 'node:events', 'node:os', 'node:buffer', 'node:process', 'node:http', 'node:https',
    'node:net', 'node:tls', 'node:dns', 'node:timers', 'node:querystring', 'node:assert',
    'fs', 'path', 'url', 'crypto', 'util', 'child_process',
    'stream', 'events', 'os', 'buffer', 'process', 'http', 'https',
    'net', 'tls', 'dns', 'timers', 'querystring', 'assert', 'cluster',
    'dgram', 'readline', 'repl', 'string_decoder', 'tty', 'v8', 'vm', 'zlib'
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
  // CRITICAL: Do NOT define process.env to preserve runtime environment variables
  const esbuildCmd = `npx esbuild server/index.ts ` +
    `--platform=node ` +
    `--target=node22 ` +
    `--bundle ` +
    `--format=esm ` +
    `--outfile=dist/index.js ` +
    `--tree-shaking=true ` +
    `--minify=false ` +
    `--keep-names=true ` +
    `--sourcemap=external ` +
    `--packages=external ` +
    `--main-fields=main,module ` +
    `--conditions=node ` +
    `--banner:js="import{createRequire}from'module';const require=createRequire(import.meta.url);" ` +
    `--define:process.env.NODE_ENV='"production"' ` +
    `${externals}`;
    
  console.log('📝 Building with enhanced Node.js polyfill support...');
  execSync(esbuildCmd, { stdio: 'inherit' });
  
  console.log('✅ Build completo - servidor compilado para node');
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}