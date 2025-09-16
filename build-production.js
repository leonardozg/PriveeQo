#!/usr/bin/env node

// Production build script for Digital Ocean App Platform
// Builds React frontend + Express backend optimized for Digital Ocean deployment

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

console.log('🔨 Building PRIVEE for Digital Ocean App Platform...');

try {
  // Cleanup previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  // Step 1: Build React frontend with Vite
  console.log('📦 Building React frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Verify frontend build
  const frontendPath = 'dist/public';
  if (!fs.existsSync(frontendPath)) {
    throw new Error('Frontend build failed - dist/public not found');
  }
  console.log('✅ Frontend built successfully');
  
  // Step 2: Build Express backend for production
  console.log('🚀 Building Express backend...');
  
  // External packages that should NOT be bundled (available via package.json)
  const externals = [
    // Node.js built-ins
    'fs', 'path', 'url', 'crypto', 'util', 'child_process', 'stream', 'events', 
    'os', 'buffer', 'process', 'http', 'https', 'net', 'tls', 'dns', 'timers',
    'node:fs', 'node:path', 'node:url', 'node:crypto', 'node:util', 'node:child_process',
    'node:stream', 'node:events', 'node:os', 'node:buffer', 'node:process',
    
    // Database & ORM
    '@neondatabase/serverless',
    'drizzle-orm',
    'drizzle-kit',
    'pg',
    
    // Express & middleware
    'express',
    'express-session',
    'connect-pg-simple',
    'multer',
    'passport',
    'passport-local',
    
    // Authentication
    'openid-client',
    'google-auth-library',
    
    // Utilities (keep external for runtime flexibility)
    'zod',
    'zod-validation-error',
    'csv-parse',
    'nanoid',
    'memoizee',
    'memorystore',
    'ws',
    'jspdf',
    
    // Babel (can be bundled or external)
    '@babel/parser',
    '@babel/traverse',
    
    // Development only (should not be in production)
    'vite',
    '@vitejs/plugin-react',
    'tsx'
  ].map(pkg => `--external:${pkg}`).join(' ');
  
  const esbuildCmd = `npx esbuild server/index-production.ts ` +
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
    `${externals}`;
    
  console.log('📝 Running esbuild for backend...');
  execSync(esbuildCmd, { stdio: 'inherit' });
  
  // Verify backend build
  if (!fs.existsSync('dist/index.js')) {
    throw new Error('Backend build failed - dist/index.js not found');
  }
  console.log('✅ Backend built successfully');

  // Step 3: Create package.json for production
  console.log('📦 Creating production package.json...');
  
  const originalPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Production-only dependencies (remove dev dependencies)
  const productionDeps = {
    "@neondatabase/serverless": originalPackageJson.dependencies["@neondatabase/serverless"],
    "@babel/parser": originalPackageJson.dependencies["@babel/parser"],
    "@babel/traverse": originalPackageJson.dependencies["@babel/traverse"],
    "express": originalPackageJson.dependencies["express"],
    "express-session": originalPackageJson.dependencies["express-session"],
    "connect-pg-simple": originalPackageJson.dependencies["connect-pg-simple"],
    "drizzle-orm": originalPackageJson.dependencies["drizzle-orm"],
    "multer": originalPackageJson.dependencies["multer"],
    "passport": originalPackageJson.dependencies["passport"],
    "passport-local": originalPackageJson.dependencies["passport-local"],
    "openid-client": originalPackageJson.dependencies["openid-client"],
    "google-auth-library": originalPackageJson.dependencies["google-auth-library"],
    "zod": originalPackageJson.dependencies["zod"],
    "zod-validation-error": originalPackageJson.dependencies["zod-validation-error"],
    "csv-parse": originalPackageJson.dependencies["csv-parse"],
    "nanoid": originalPackageJson.dependencies["nanoid"],
    "memoizee": originalPackageJson.dependencies["memoizee"],
    "memorystore": originalPackageJson.dependencies["memorystore"],
    "ws": originalPackageJson.dependencies["ws"],
    "jspdf": originalPackageJson.dependencies["jspdf"],
    "pg": originalPackageJson.dependencies["pg"]
  };

  const productionPackageJson = {
    name: originalPackageJson.name,
    version: originalPackageJson.version,
    type: "module",
    engines: {
      node: ">=22.0.0"
    },
    scripts: {
      start: "node index.js"
    },
    dependencies: productionDeps
  };

  fs.writeFileSync('dist/package.json', JSON.stringify(productionPackageJson, null, 2));
  console.log('✅ Production package.json created');

  // Step 4: Copy any additional required files
  console.log('📋 Copying additional files...');
  
  // Copy logo to public directory if exists
  if (fs.existsSync('client/public/logo.jpg')) {
    execSync('cp client/public/logo.jpg dist/public/', { stdio: 'inherit' });
    console.log('📸 Logo copied to build');
  }

  console.log('🎉 Build completed successfully!');
  console.log('📁 Files ready for deployment:');
  console.log('   - dist/index.js (backend server)');
  console.log('   - dist/package.json (production dependencies)');
  console.log('   - dist/public/ (frontend static files)');
  console.log('');
  console.log('🚀 Ready for Digital Ocean deployment!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}