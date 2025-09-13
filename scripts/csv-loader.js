// Script para cargar productos desde CSV
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

// Función para parsear CSV mejorada con soporte para punto y coma
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  
  // Detectar el separador (coma o punto y coma)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';
  
  const headers = firstLine.split(delimiter).map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Manejar comillas y delimitadores en CSV
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const item = {};
    
    headers.forEach((header, index) => {
      let value = values[index]?.replace(/^"|"$/g, '').trim() || '';
      
      // Limpiar y convertir tipos apropiados
      if (header === 'basePrice') {
        value = value.replace(/\s+/g, ''); // Quitar espacios
        value = parseFloat(value).toFixed(2);
      } else if (header === 'minMargin' || header === 'maxMargin') {
        value = value.replace('%', '').trim(); // Quitar %
        let numValue = parseFloat(value);
        // Si el valor es decimal (0.15), convertir a porcentaje (15)
        if (numValue <= 1) {
          numValue = Math.round(numValue * 100);
        }
        value = parseInt(numValue);
      }
      
      item[header] = value;
    });
    
    return item;
  });
}

async function loadProductsFromCSV(csvFilePath) {
  console.log('📂 Cargando productos desde CSV...');
  
  try {
    // Leer archivo CSV
    const csvPath = path.resolve(csvFilePath);
    if (!fs.existsSync(csvPath)) {
      console.log('❌ Archivo CSV no encontrado:', csvPath);
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const products = parseCSV(csvContent);
    
    console.log(`📋 ${products.length} productos encontrados en CSV`);
    
    let createdCount = 0;
    let errorCount = 0;
    
    // Cargar cada producto
    for (const product of products) {
      try {
        const response = await fetch(`${API_BASE}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
        
        if (response.ok) {
          console.log(`✅ Producto creado: ${product.name}`);
          createdCount++;
        } else {
          const error = await response.text();
          console.log(`❌ Error creando ${product.name}: ${error}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Error de red con ${product.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 ¡Carga desde CSV completada!');
    console.log(`📊 Resumen:`);
    console.log(`   • ${createdCount} productos creados exitosamente`);
    if (errorCount > 0) {
      console.log(`   • ${errorCount} productos con errores`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la carga:', error);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[2]) {
  loadProductsFromCSV(process.argv[2]);
} else {
  console.log('Uso: node csv-loader.js <ruta-al-archivo.csv>');
  console.log('Ejemplo: node csv-loader.js products.csv');
}

export { loadProductsFromCSV };