const fs = require('fs');

// Read the UTF8 converted file
const csvContent = fs.readFileSync('attached_assets/data_1754832537495_utf8.csv', 'utf8');

// Fix all Spanish character corruptions
const fixedContent = csvContent
  .replace(/acompaados/g, 'acompañados')
  .replace(/Caf americano/g, 'Café americano')
  .replace(/T verde/g, 'Té verde')
  .replace(/diseo/g, 'diseño')
  .replace(/Men /g, 'Menú ')
  .replace(/Menu/g, 'Menú')
  .replace(/mantelera/g, 'mantelería')
  .replace(/cristalera/g, 'cristalería')
  .replace(/Decoracin/g, 'Decoración')
  .replace(/Capitan/g, 'Capitán')
  .replace(/menú/g, 'menú')
  .replace(/plaqu/g, 'plaqué')
  .replace(/Nmeros/g, 'Números')
  .replace(/Rstica/g, 'Rústica')
  .replace(/Salmn/g, 'Salmón')
  .replace(/Ejecucin/g, 'Ejecución')
  .replace(/Musicalizacin/g, 'Musicalización')
  .replace(/Iluminacin/g, 'Iluminación')
  .replace(/Amplificacin/g, 'Amplificación')
  .replace(/Audio y vdeo/g, 'Audio y vídeo')
  .replace(/Fotografa/g, 'Fotografía')
  .replace(/Sesin/g, 'Sesión')
  .replace(/fotgrafa/g, 'fotógrafa')
  .replace(/edicin/g, 'edición')
  .replace(/revelacin/g, 'revelación')
  .replace(/lbum/g, 'álbum')
  .replace(/Temtica/g, 'Temática')
  .replace(/Personalizacin/g, 'Personalización')
  .replace(/Cotilln/g, 'Cotillón')
  .replace(/Recuerdos temticos/g, 'Recuerdos temáticos')
  .replace(/Recuerdos de eventos temticos/g, 'Recuerdos de eventos temáticos')
  .replace(/Bistek/g, 'Bistec')
  .replace(/Caf y T/g, 'Café y Té')
  .replace(/Servicio de Caf/g, 'Servicio de Café');

// Write the corrected content
fs.writeFileSync('attached_assets/data_final_corrected.csv', fixedContent, 'utf8');

// Count lines
const lines = fixedContent.split('\n').filter(line => line.trim());
console.log(`✅ Archivo CSV corregido guardado con ${lines.length - 1} productos`);
console.log('📂 Archivo: attached_assets/data_final_corrected.csv');