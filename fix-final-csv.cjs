const fs = require('fs');

// Read the original UTF8 converted file
const csvContent = fs.readFileSync('attached_assets/data_1754835209226_utf8.csv', 'utf8');

console.log('🔧 Corrigiendo caracteres específicos del archivo original...');

// Apply targeted corrections only to fix encoding issues
let fixedContent = csvContent
  // Fix ñ characters
  .replace(/acompaados/g, 'acompañados')
  .replace(/diseo/g, 'diseño')
  .replace(/Bistek/g, 'Bistec')
  
  // Fix specific accented characters
  .replace(/Caf americano/g, 'Café americano')
  .replace(/([^a-zA-Z])T verde/g, '$1Té verde')
  .replace(/Servicio de Caf/g, 'Servicio de Café')
  .replace(/([^a-zA-Z])T,/g, '$1Té,')
  
  // Fix specific words
  .replace(/mantelera/g, 'mantelería')
  .replace(/cristalera/g, 'cristalería')
  .replace(/Decoracin/g, 'Decoración')
  .replace(/plaqu/g, 'plaqué')
  .replace(/Capitan/g, 'Capitán')
  .replace(/([^a-zA-Z])men([^a-zA-Z])/g, '$1menú$2')
  
  // Fix "Menu" to "Menú" only in specific contexts (names and categories)
  .replace(/^([^,]+) Menu,/gm, '$1 Menú,')
  .replace(/,Menu,/g, ',Menú,');

// Write the corrected content  
fs.writeFileSync('attached_assets/data_final_corrected.csv', fixedContent, 'utf8');

// Count lines
const lines = fixedContent.split('\n').filter(line => line.trim());
console.log(`✅ Base de datos corregida: ${lines.length - 1} productos`);
console.log('📂 Archivo: data_final_corrected.csv');

// Show sample of key corrections
console.log('\n🔤 Verificando correcciones:');
const sampleLines = fixedContent.split('\n').slice(1, 4);
sampleLines.forEach((line, i) => {
  const name = line.split(',')[0];
  const hasSpanish = name.includes('ñ') || name.includes('á') || name.includes('é') || name.includes('í') || name.includes('ó') || name.includes('ú');
  console.log(`  ${hasSpanish ? '✓' : '•'} ${name}`);
});