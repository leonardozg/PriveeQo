const fs = require('fs');

// Read the converted file
let csvContent = fs.readFileSync('attached_assets/data_1754835209226_utf8.csv', 'utf8');

console.log('🔧 Corrigiendo caracteres españoles en el archivo original...');

// Fix all Spanish character corruptions systematically
csvContent = csvContent
  // Fix ñ characters
  .replace(/acompaados/g, 'acompañados')
  .replace(/diseo/g, 'diseño')
  .replace(/Bistek/g, 'Bistec')
  
  // Fix accented characters
  .replace(/Caf americano/g, 'Café americano')
  .replace(/T verde/g, 'Té verde')
  .replace(/Servicio de Caf/g, 'Servicio de Café')
  .replace(/Caf y T/g, 'Café y Té')
  
  // Fix other accented words
  .replace(/mantelera/g, 'mantelería')
  .replace(/cristalera/g, 'cristalería')
  .replace(/Decoracin/g, 'Decoración')
  .replace(/plaqu/g, 'plaqué')
  .replace(/Capitan/g, 'Capitán')
  .replace(/men/g, 'menú')
  .replace(/Men/g, 'Menú')
  
  // Fix Menu to Menú in the name field only (first column)
  .replace(/^([^,]+) Menu,/gm, '$1 Menú,')
  .replace(/al men/g, 'al menú')
  
  // Fix other words that might have accent issues
  .replace(/Nmeros/g, 'Números')
  .replace(/Rstica/g, 'Rústica')
  .replace(/Salmn/g, 'Salmón')
  .replace(/Ejecucin/g, 'Ejecución')
  .replace(/Musicalizacin/g, 'Musicalización')
  .replace(/Iluminacin/g, 'Iluminación')
  .replace(/Amplificacin/g, 'Amplificación')
  .replace(/Fotografa/g, 'Fotografía')
  .replace(/Sesin/g, 'Sesión')
  .replace(/fotgrafa/g, 'fotógrafa')
  .replace(/edicin/g, 'edición')
  .replace(/revelacin/g, 'revelación')
  .replace(/lbum/g, 'álbum')
  .replace(/Temtica/g, 'Temática')
  .replace(/Personalizacin/g, 'Personalización')
  .replace(/Cotilln/g, 'Cotillón')
  .replace(/temticos/g, 'temáticos');

// Write the corrected file
fs.writeFileSync('attached_assets/data_corrected.csv', csvContent, 'utf8');

// Count lines and show stats
const lines = csvContent.split('\n').filter(line => line.trim());
console.log(`✅ Archivo corregido: ${lines.length - 1} productos`);
console.log('💾 Guardado como: data_corrected.csv');

// Verify corrections by checking for key Spanish characters
const hasÑ = csvContent.includes('ñ');
const hasAccents = csvContent.includes('á') || csvContent.includes('é') || csvContent.includes('í');
console.log(`🔤 Verificación: ñ=${hasÑ}, acentos=${hasAccents}`);

// Show sample of corrected names
const sampleLines = csvContent.split('\n').slice(1, 4);
sampleLines.forEach((line, i) => {
  const name = line.split(',')[0];
  console.log(`📝 Ejemplo ${i+1}: ${name}`);
});