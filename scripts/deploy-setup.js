// Script de configuración para despliegue
// Se ejecuta automáticamente antes del deploy para asegurar datos iniciales

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://tu-app.replit.app/api'  // URL de producción
  : 'http://localhost:5000/api';     // URL de desarrollo

async function setupProductionData() {
  console.log('🚀 Configurando datos para producción...');
  
  try {
    // Verificar si ya existen datos
    const itemsRes = await fetch(`${API_BASE}/items`);
    const items = await itemsRes.json();
    
    if (items.length > 0) {
      console.log(`📦 Ya existen ${items.length} productos en la base de datos`);
      return;
    }
    
    console.log('📋 Base de datos vacía, cargando datos iniciales...');
    
    // Cargar datos usando los scripts existentes
    const { execSync } = require('child_process');
    
    execSync('node scripts/seed-data.js', { 
      stdio: 'inherit',
      env: { ...process.env, API_BASE }
    });
    
    console.log('✅ Datos de producción cargados exitosamente');
    
  } catch (error) {
    console.error('❌ Error configurando datos:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupProductionData();
}

module.exports = { setupProductionData };