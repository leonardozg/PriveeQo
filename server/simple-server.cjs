const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist', 'public')));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not built');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Simple server running on port ${port}`);
});