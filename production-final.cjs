const express = require('express');
const path = require('path');

console.log('🚀 Starting PRIVEE production server with CSV support...');

const app = express();

// REPLIT DEPLOYMENT FIX: Enhanced middleware for CSV uploads (NO external dependencies)
app.use(express.json({ limit: '50mb' })); // Increased for CSV files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: 'text/csv' })); // For CSV content

// Native cookie parser (no dependencies)
function parseCookies(req, res, next) {
  const cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookies[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
  }
  req.cookies = cookies;
  
  // Add cookie helper to response
  res.cookie = function(name, value, options = {}) {
    const opts = {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      ...options
    };
    
    let cookieStr = `${name}=${encodeURIComponent(value)}`;
    if (opts.maxAge) cookieStr += `; Max-Age=${Math.floor(opts.maxAge / 1000)}`;
    if (opts.httpOnly) cookieStr += '; HttpOnly';
    if (opts.secure) cookieStr += '; Secure';
    cookieStr += '; Path=/';
    
    res.setHeader('Set-Cookie', cookieStr);
    return res;
  };
  
  res.clearCookie = function(name) {
    res.setHeader('Set-Cookie', `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`);
    return res;
  };
  
  next();
}

app.use(parseCookies); // Native cookie support

// Admin credentials
const ADMIN = {
  username: 'admin',
  password: 'Admin2025!'
};

// Partner credentials (production-compatible)
const PARTNERS = [
  {
    id: 'partner_1',
    username: 'Alonso1',
    password: 'socio123',
    fullName: 'Alonso García',
    email: 'alonso@privee.com',
    phone: '+52 55 1234 5678',
    companyName: 'Eventos García',
    status: 'active'
  },
  {
    id: 'partner_2', 
    username: 'Maria2',
    password: 'eventos456',
    fullName: 'María Fernández',
    email: 'maria@privee.com',
    phone: '+52 55 9876 5432',
    companyName: 'Fernández Eventos',
    status: 'active'
  },
  {
    id: 'partner_3',
    username: 'Carlos3',
    password: 'premium789',
    fullName: 'Carlos Rodríguez',
    email: 'carlos@privee.com',
    phone: '+52 55 5555 1234',
    companyName: 'Premium Events',
    status: 'active'
  }
];

let adminLoggedIn = false;
let partnerSessions = {}; // Store partner sessions

// REPLIT DEPLOYMENT FIX: Complete product catalog including Mobiliario category
let products = [
  // Menú
  {
    id: 'menu_1',
    name: 'Desayuno Continental',
    description: 'Café, jugos naturales, frutas de temporada, pan dulce y salado',
    category: 'Menú',
    basePrice: '150',
    minMargin: 15,
    maxMargin: 25,
    quality: 'Plata',
    ambientacion: 'Club',
    status: 'active'
  },
  {
    id: 'menu_2', 
    name: 'Cena Gala',
    description: 'Menú de tres tiempos con proteína premium',
    category: 'Menú',
    basePrice: '450',
    minMargin: 20,
    maxMargin: 35,
    quality: 'Platino',
    ambientacion: 'Gala',
    status: 'active'
  },
  // Audio y Video
  {
    id: 'audio_1',
    name: 'DJ Profesional',
    description: 'Servicio de DJ con equipo de audio profesional 4 horas',
    category: 'Audio y Video',
    basePrice: '3500',
    minMargin: 15,
    maxMargin: 30,
    quality: 'Oro',
    ambientacion: 'Club',
    status: 'active'
  },
  // MOBILIARIO - Essential items that were missing
  {
    id: 'mobiliario_1',
    name: 'Mesa Redonda 8 personas',
    description: 'Mesa redonda para 8 comensales con mantel incluido',
    category: 'Mobiliario',
    basePrice: '200',
    minMargin: 15,
    maxMargin: 25,
    quality: 'Plata',
    ambientacion: 'Club',
    status: 'active'
  },
  {
    id: 'mobiliario_2',
    name: 'Mesa Imperial 12 personas',
    description: 'Mesa rectangular imperial para 12 comensales',
    category: 'Mobiliario',
    basePrice: '350',
    minMargin: 20,
    maxMargin: 30,
    quality: 'Oro',
    ambientacion: 'Ceremonia',
    status: 'active'
  },
  {
    id: 'mobiliario_3',
    name: 'Sillas Tiffany',
    description: 'Sillas elegantes estilo Tiffany con cojín',
    category: 'Mobiliario',
    basePrice: '45',
    minMargin: 15,
    maxMargin: 25,
    quality: 'Plata',
    ambientacion: 'Ceremonia',
    status: 'active'
  },
  {
    id: 'mobiliario_4',
    name: 'Lounge Premium',
    description: 'Conjunto de sala lounge con sofás y mesa de centro',
    category: 'Mobiliario',
    basePrice: '800',
    minMargin: 20,
    maxMargin: 35,
    quality: 'Platino',
    ambientacion: 'Club',
    status: 'active'
  },
  {
    id: 'mobiliario_5',
    name: 'Barra de Bar',
    description: 'Barra de bar premium con accesorios incluidos',
    category: 'Mobiliario',
    basePrice: '500',
    minMargin: 15,
    maxMargin: 30,
    quality: 'Oro',
    ambientacion: 'Club',
    status: 'active'
  },
  // Decoración
  {
    id: 'decoracion_1',
    name: 'Centro de Mesa Floral',
    description: 'Arreglo floral premium para centro de mesa',
    category: 'Decoración',
    basePrice: '180',
    minMargin: 20,
    maxMargin: 35,
    quality: 'Platino',
    ambientacion: 'Gala',
    status: 'active'
  },
  {
    id: 'decoracion_2',
    name: 'Iluminación Ambiental',
    description: 'Sistema de iluminación LED ambiental multicolor',
    category: 'Decoración',
    basePrice: '400',
    minMargin: 15,
    maxMargin: 30,
    quality: 'Oro',
    ambientacion: 'Gala',
    status: 'active'
  }
];

// CSV parser function (simple implementation)
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

// Routes
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for:', username);
  
  if (username === ADMIN.username && password === ADMIN.password) {
    adminLoggedIn = true;
    console.log('✅ Admin login successful');
    res.json({ success: true, user: { username } });
  } else {
    console.log('❌ Invalid credentials');
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/admin/me', (req, res) => {
  if (adminLoggedIn) {
    res.json({ authenticated: true, user: { username: ADMIN.username } });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  adminLoggedIn = false;
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production',
    isProduction: true,
    databaseConnected: true,
    itemsCount: products.length,
    admin: adminLoggedIn
  });
});

// REPLIT DEPLOYMENT FIX: CSV upload endpoint (without multer)
app.post('/api/admin/upload-csv', (req, res) => {
  try {
    console.log('📂 Processing CSV upload in production mode...');
    console.log('Request content-type:', req.get('Content-Type'));
    console.log('Request body type:', typeof req.body);
    
    let csvContent = '';
    
    // Handle different content types
    if (typeof req.body === 'string') {
      csvContent = req.body;
    } else if (req.body && req.body.csvContent) {
      csvContent = req.body.csvContent;
    } else if (req.body && req.body.data) {
      csvContent = req.body.data;
    } else {
      console.log('❌ No CSV content found in request');
      return res.status(400).json({
        success: false,
        message: 'No se encontró contenido CSV válido. Asegúrate de que el archivo se envíe correctamente.'
      });
    }
    
    if (!csvContent || csvContent.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El contenido CSV está vacío'
      });
    }
    
    console.log(`📊 Processing ${csvContent.length} characters of CSV data`);
    
    // Parse CSV
    const records = parseCSV(csvContent);
    console.log(`📋 Found ${records.length} records in CSV`);
    
    let stats = { items: 0, partners: 0, adminUsers: 0 };
    
    // Process each record
    records.forEach((record, index) => {
      try {
        if (!record.name || !record.category || !record.basePrice) {
          console.log(`⚠️ Skipping record ${index + 1}: missing required fields`);
          return;
        }
        
        const newProduct = {
          id: `csv_${Date.now()}_${index}`,
          name: String(record.name).trim(),
          description: String(record.description || '').trim(),
          category: String(record.category).trim(),
          basePrice: String(record.basePrice).trim(),
          minMargin: parseInt(record.minMargin) || 15,
          maxMargin: parseInt(record.maxMargin) || 30,
          quality: String(record.quality || 'Oro').trim(),
          ambientacion: String(record.ambientacion || 'Club').trim(),
          status: 'active'
        };
        
        products.push(newProduct);
        stats.items++;
        
      } catch (error) {
        console.error(`❌ Error processing record ${index + 1}:`, error);
      }
    });
    
    console.log(`✅ CSV import completed: ${stats.items} products imported`);
    
    res.json({
      success: true,
      message: `CSV importado exitosamente con ${stats.items} productos`,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error processing CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el archivo CSV',
      errors: [error.message || 'Error desconocido']
    });
  }
});

// REPLIT DEPLOYMENT FIX: Bulk import with CSV data loading
app.post('/api/admin/bulk-import', (req, res) => {
  try {
    console.log('🚀 Starting bulk import...');
    
    // LOAD EMBEDDED CSV DATA - Based on data_1754941995278.csv
    const csvData = `name,description,category,quality,ambientacion,basePrice,minMargin,maxMargin,status
Mesa redonda con mantelería fina,Sillas plegables Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Plata,Club,326.09,0.15,0.25,active
Mesa redonda con mantelería fina,Sillas plegables Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Plata,Ceremonia,342.35,0.15,0.25,active
Mesa redonda con mantelería fina,Sillas plegables Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Plata,Gala,763.22,0.15,0.25,active
Mesa redonda con mantelería fina,Sillas Tiffany Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Oro,Club,316.48,0.15,0.3,active
Mesa redonda con mantelería fina,Sillas Tiffany Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Oro,Ceremonia,321.52,0.15,0.3,active
Mesa redonda con mantelería fina,Sillas Tiffany Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Oro,Gala,402.17,0.15,0.3,active
Mesa redonda con mantelería fina,Sillas Chiavari Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Platino,Club,652.17,0.15,0.35,active
Mesa redonda con mantelería fina,Sillas Chiavari Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Platino,Ceremonia,668.48,0.15,0.35,active
Mesa redonda con mantelería fina,Sillas Chiavari Vajilla cubiertos y cristalería Plato base de diseño,Mobiliario,Platino,Gala,1033.70,0.15,0.35,active
Centro de mesa en bajo,Iluminación ambiental,Decoración,Plata,Club,97.83,0.15,0.25,active
Centro de mesa en bajo,Iluminación ambiental,Decoración,Plata,Ceremonia,108.70,0.15,0.25,active
Centro de mesa en bajo,Iluminación ambiental,Decoración,Plata,Gala,195.65,0.15,0.25,active
Centro de mesa en alto,Iluminación ambiental,Decoración,Oro,Club,152.17,0.15,0.3,active
Centro de mesa en alto,Iluminación ambiental,Decoración,Oro,Ceremonia,163.04,0.15,0.3,active
Centro de mesa en alto,Iluminación ambiental,Decoración,Oro,Gala,271.74,0.15,0.3,active
Centro de mesa en alto,Iluminación ambiental de color,Decoración,Platino,Club,315.22,0.15,0.35,active
Centro de mesa en alto,Iluminación ambiental de color,Decoración,Platino,Ceremonia,326.09,0.15,0.35,active
Centro de mesa en alto,Iluminación ambiental de color,Decoración,Platino,Gala,456.52,0.15,0.35,active
Equipo de sonido básico,Micrófono inalámbrico,Audio y Video,Plata,Club,2173.91,0.15,0.25,active
Equipo de sonido básico,Micrófono inalámbrico,Audio y Video,Plata,Ceremonia,2282.61,0.15,0.25,active
Equipo de sonido profesional,DJ Micrófono inalámbrico,Audio y Video,Oro,Club,4347.83,0.15,0.3,active
Equipo de sonido profesional,DJ Micrófono inalámbrico,Audio y Video,Oro,Ceremonia,4456.52,0.15,0.3,active
Equipo de sonido profesional,DJ Micrófono inalámbrico,Audio y Video,Oro,Gala,6521.74,0.15,0.3,active
Equipo de sonido premium,DJ profesional Micrófono inalámbrico Luces,Audio y Video,Platino,Club,8695.65,0.15,0.35,active
Equipo de sonido premium,DJ profesional Micrófono inalámbrico Luces,Audio y Video,Platino,Ceremonia,8804.35,0.15,0.35,active
Equipo de sonido premium,DJ profesional Micrófono inalámbrico Luces,Audio y Video,Platino,Gala,13043.48,0.15,0.35,active`;

    // FORCE RESET: Always clear products for fresh load
    console.log(`🗑️ Eliminando ${products.length} productos existentes`);
    products = [];
    console.log("✅ Array de productos reseteado completamente");
    
    const records = parseCSV(csvData);
    let stats = { items: 0, partners: 0, adminUsers: 1 };
    
    console.log(`📋 Processing ${records.length} CSV records for bulk import...`);
    
    // Process each record
    records.forEach((record, index) => {
      try {
        if (!record.name || !record.category || !record.basePrice) {
          console.log(`⚠️ Skipping record ${index + 1}: missing required fields`);
          return;
        }
        
        const newProduct = {
          id: `bulk_${Date.now()}_${index}`,
          name: String(record.name).trim(),
          description: String(record.description || '').trim(),
          category: String(record.category).trim(),
          basePrice: String(Math.round(parseFloat(record.basePrice) || 0)),
          minMargin: Math.round((parseFloat(record.minMargin) || 0.15) * 100),
          maxMargin: Math.round((parseFloat(record.maxMargin) || 0.30) * 100),
          quality: String(record.quality || 'Oro').trim(),
          ambientacion: String(record.ambientacion || 'Club').trim(),
          status: 'active'
        };
        
        products.push(newProduct);
        stats.items++;
        
      } catch (error) {
        console.error(`❌ Error processing record ${index + 1}:`, error);
      }
    });
    
    console.log(`✅ Bulk import completed: ${stats.items} products loaded from embedded CSV`);
    
    res.json({
      success: true,
      message: `Importación completada: ${stats.items} productos cargados exitosamente`,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error in bulk import:', error);
    res.status(500).json({
      success: false,
      message: 'Error durante la importación masiva',
      errors: [error.message || 'Error desconocido']
    });
  }
});

// Get items endpoint
app.get('/api/admin/items', (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

// Reset database endpoint
app.post('/api/admin/reset-database', (req, res) => {
  try {
    console.log('🗑️ Resetting products database...');
    products = [];
    
    res.json({
      success: true,
      message: 'Productos eliminados exitosamente'
    });
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar la base de datos'
    });
  }
});

// REPLIT DEPLOYMENT FIX: Partner authentication endpoints (production-compatible)
app.post('/api/partner/login', (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Partner login attempt:', username);
    
    const partner = PARTNERS.find(p => p.username === username && p.password === password && p.status === 'active');
    
    if (partner) {
      // Create session token
      const sessionId = `partner_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      partnerSessions[sessionId] = {
        partnerId: partner.id,
        username: partner.username,
        loginTime: new Date().toISOString()
      };
      
      console.log('✅ Partner login successful:', username);
      
      // Set session cookie
      res.cookie('partner_session', sessionId, { 
        httpOnly: true, 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json({
        id: partner.id,
        username: partner.username,
        fullName: partner.fullName,
        email: partner.email,
        phone: partner.phone,
        companyName: partner.companyName,
        status: partner.status
      });
    } else {
      console.log('❌ Invalid partner credentials for:', username);
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('❌ Partner login error:', error);
    res.status(500).json({ message: 'Error en el login' });
  }
});

app.get('/api/partner/me', (req, res) => {
  try {
    const sessionId = req.cookies?.partner_session;
    
    if (!sessionId || !partnerSessions[sessionId]) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const session = partnerSessions[sessionId];
    const partner = PARTNERS.find(p => p.id === session.partnerId);
    
    if (!partner) {
      delete partnerSessions[sessionId];
      return res.status(401).json({ message: 'Partner not found' });
    }
    
    res.json({
      id: partner.id,
      username: partner.username,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone,
      companyName: partner.companyName,
      status: partner.status
    });
  } catch (error) {
    console.error('❌ Partner me error:', error);
    res.status(500).json({ message: 'Error getting partner info' });
  }
});

app.post('/api/partner/logout', (req, res) => {
  try {
    const sessionId = req.cookies?.partner_session;
    
    if (sessionId && partnerSessions[sessionId]) {
      delete partnerSessions[sessionId];
      console.log('✅ Partner logged out');
    }
    
    res.clearCookie('partner_session');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Partner logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

// Partner change password endpoint
app.post('/api/partner/change-password', (req, res) => {
  try {
    const sessionId = req.cookies?.partner_session;
    
    if (!sessionId || !partnerSessions[sessionId]) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { currentPassword, newPassword } = req.body;
    const session = partnerSessions[sessionId];
    const partnerIndex = PARTNERS.findIndex(p => p.id === session.partnerId);
    
    if (partnerIndex === -1) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    const partner = PARTNERS[partnerIndex];
    
    if (partner.password !== currentPassword) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Update password
    PARTNERS[partnerIndex].password = newPassword;
    console.log('✅ Partner password changed:', partner.username);
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('❌ Partner change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Get partners list (for admin)
app.get('/api/partners', (req, res) => {
  try {
    // Return partners without passwords
    const partnersList = PARTNERS.map(p => ({
      id: p.id,
      username: p.username,
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      companyName: p.companyName,
      status: p.status
    }));
    
    res.json(partnersList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch partners' });
  }
});

// Static files
const staticPath = path.join(__dirname, 'dist', 'public');
console.log('Static files path:', staticPath);

try {
  app.use(express.static(staticPath));
  console.log('✅ Static middleware configured');
} catch (err) {
  console.error('❌ Static middleware error:', err);
}

// SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API not found' });
  }
  
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Could not load app');
    }
  });
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
  
  console.log('🚀 Production server running!');
  console.log(`📍 Port: ${port}`);
  console.log(`🔐 Admin: ${ADMIN.username} / ${ADMIN.password}`);
  console.log(`📁 Static: ${staticPath}`);
});