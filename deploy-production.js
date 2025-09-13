#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Create the absolute minimal production server
const productionServerCode = `const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Minimal admin auth
const adminCreds = { username: 'admin', password: 'Admin2025!' };
let adminSession = null;

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminCreds.username && password === adminCreds.password) {
    adminSession = { username, loginTime: Date.now() };
    res.json({ success: true, user: { username } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Admin check
app.get('/api/admin/me', (req, res) => {
  if (adminSession) {
    res.json({ authenticated: true, user: adminSession });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  adminSession = null;
  res.json({ message: 'Logged out' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Static files
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(\`Server running on port \${port}\`);
});`;

// Write the production server
fs.writeFileSync('production-minimal.js', productionServerCode);

// Update package.json to use this server
const packagePath = './package.json';
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add production start script  
pkg.scripts.start = 'REPLIT_DEPLOYMENT=1 NODE_ENV=production node dist/index.js';

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

console.log('✅ Production server created: production-minimal.js');
console.log('✅ Package.json updated with start script');
console.log('');
console.log('🚀 Ready for deployment:');
console.log('1. Build: npm run build');
console.log('2. Start: npm start');
console.log('');
console.log('Admin credentials: admin / Admin2025!');