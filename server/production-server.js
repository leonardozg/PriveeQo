import express from 'express';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import memorystore from 'memorystore';

const MemoryStore = memorystore(session);
const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  store: new MemoryStore({ checkPeriod: 86400000 }),
  secret: process.env.SESSION_SECRET || 'privee-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// In-memory admin user for testing
const ADMIN_USER = {
  username: 'admin',
  password: 'Admin2025!' // Simple comparison for testing
};

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, hasPassword: !!password });
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      req.session.adminUser = { username: ADMIN_USER.username };
      console.log('Admin login successful');
      res.json({ 
        success: true, 
        message: 'Login successful',
        user: { username: ADMIN_USER.username }
      });
    } else {
      console.log('Invalid credentials');
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
});

// Check admin session
app.get('/api/admin/me', (req, res) => {
  try {
    if (req.session && req.session.adminUser) {
      res.json({ 
        authenticated: true, 
        user: req.session.adminUser 
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ message: 'Session check failed', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    session: !!req.session
  });
});

// Debug session endpoint
app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    authenticated: !!req.session?.adminUser
  });
});

// Static files
const publicPath = path.join(__dirname, '..', 'dist', 'public');
if (fs.existsSync(publicPath)) {
  console.log('Serving static files from:', publicPath);
  app.use(express.static(publicPath));
} else {
  console.error('Static files not found at:', publicPath);
}

// Catch all for SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ message: 'App not built' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Production server with auth running on port ${port}`);
  console.log(`Admin credentials: admin / Admin2025!`);
});