#!/usr/bin/env node

// Build script ULTRA-SIMPLE para DigitalOcean
// Solo frontend - backend se ejecuta con tsx

import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'fs';

console.log('🔨 Build ultra-simple para DigitalOcean...');

try {
  // Solo build frontend
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Copiar package.json para node_modules en runtime
  console.log('📋 Copying package files...');
  mkdirSync('dist', { recursive: true });
  copyFileSync('package.json', 'dist/package.json');
  
  console.log('✅ Build completado - server ejecutará con tsx');
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}