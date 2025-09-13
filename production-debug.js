#!/usr/bin/env node

// Production debugging script to identify 500 errors
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Production Debug Analysis Starting...');

// Set production environment
process.env.REPLIT_DEPLOYMENT = '1';
process.env.NODE_ENV = 'production';

const app = express();

// Enhanced error logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Try to load the main application
try {
  console.log('📁 Current directory:', process.cwd());
  console.log('📁 Dist directory exists:', fs.existsSync('./dist'));
  console.log('📁 Dist/index.js exists:', fs.existsSync('./dist/index.js'));
  
  // Test import without execution
  console.log('🔄 Testing module import...');
  
  const server = app.listen(3003, '0.0.0.0', () => {
    console.log('🚀 Debug server running on port 3003');
    
    // Try to import the main server module
    import('./dist/index.js').then(() => {
      console.log('✅ Main module imported successfully');
      process.exit(0);
    }).catch(error => {
      console.error('❌ Module import failed:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    });
  });
  
  server.on('error', (error) => {
    console.error('🚨 Server error:', error);
  });
  
} catch (error) {
  console.error('❌ Failed to start debug server:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Timeout after 30 seconds
setTimeout(() => {
  console.log('⏰ Debug timeout reached');
  process.exit(1);
}, 30000);