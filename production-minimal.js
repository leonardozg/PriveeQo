const express = require('express');
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
  console.log(`Server running on port ${port}`);
});