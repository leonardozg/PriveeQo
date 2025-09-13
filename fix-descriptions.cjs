const fs = require('fs');

// Read the current corrected file
let csvContent = fs.readFileSync('attached_assets/data_spanish_corrected.csv', 'utf8');

console.log('🔧 Corrigiendo descripciones...');

// Fix descriptions specifically
csvContent = csvContent
  // Within descriptions (text inside quotes)
  .replace(/"([^"]*?)acompaados([^"]*?)"/g, '"$1acompañados$2"')
  .replace(/"([^"]*?)Caf americano([^"]*?)"/g, '"$1Café americano$2"')
  .replace(/"([^"]*?)T verde([^"]*?)"/g, '"$1Té verde$2"')
  .replace(/"([^"]*?)diseo([^"]*?)"/g, '"$1diseño$2"')
  .replace(/"([^"]*?)mantelera([^"]*?)"/g, '"$1mantelería$2"')
  .replace(/"([^"]*?)cristalera([^"]*?)"/g, '"$1cristalería$2"')
  .replace(/"([^"]*?)Men personalizado([^"]*?)"/g, '"$1Menú personalizado$2"')
  .replace(/"([^"]*?)Capitan([^"]*?)"/g, '"$1Capitán$2"')
  .replace(/"([^"]*?)Servicio de Caf([^"]*?)"/g, '"$1Servicio de Café$2"');

// Write the final corrected content
fs.writeFileSync('attached_assets/data_final_spanish.csv', csvContent, 'utf8');

// Count lines
const lines = csvContent.split('\n').filter(line => line.trim());
console.log(`✅ Archivo final: ${lines.length - 1} productos con acentos corregidos`);

// Show sample of corrected descriptions
console.log('\n📋 Muestra de descripciones corregidas:');
const sampleLines = csvContent.split('\n').slice(1, 4);
sampleLines.forEach((line, i) => {
  const description = line.match(/"([^"]*)"/);
  if (description && description[1].includes('ñ')) {
    console.log(`  ✓ Producto ${i+1}: ...${description[1].substring(0, 60)}...`);
  }
});