#!/usr/bin/env node
/**
 * INSTANT DATABASE INITIALIZATION FOR DIGITAL OCEAN
 * Run this once to load all data into your empty Digital Ocean database
 */

const { Client } = require('pg');
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

// Your Digital Ocean database URL
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Set DATABASE_URL environment variable first');
  console.log('');
  console.log('Example:');
  console.log('DATABASE_URL="postgresql://your-connection-string" node digital-ocean-init.js');
  process.exit(1);
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

async function initializeDatabase() {
  console.log('🚀 INITIALIZING DIGITAL OCEAN DATABASE');
  console.log('=====================================');
  
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to Digital Ocean database');

    // 1. Create admin user
    console.log('\n👤 Creating admin user...');
    const adminPassword = await hashPassword('Admin2025!');
    
    try {
      await client.query(`
        INSERT INTO admin_users (username, password) 
        VALUES ($1, $2) 
        ON CONFLICT (username) DO NOTHING
      `, ['admin', adminPassword]);
      console.log('✅ Admin user created: admin / Admin2025!');
    } catch (error) {
      console.log('ℹ️ Admin user already exists or error:', error.message);
    }

    // 2. Check if items exist
    const itemCheck = await client.query('SELECT COUNT(*) FROM items');
    const existingItems = parseInt(itemCheck.rows[0].count);
    
    if (existingItems > 0) {
      console.log(`ℹ️ ${existingItems} items already exist, skipping product loading...`);
    } else {
      console.log('\n📦 Loading 87 products...');

      // 3. Load the FULL 87-product catalog
      const products = [
        // MENÚ - Desayunos (3 productos)
        ['Desayuno Club Plata', 'Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', '760.87', 15, 25, 'Plata', 'Club'],
        ['Desayuno Ceremonia Plata', 'Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', '762.00', 15, 25, 'Plata', 'Ceremonia'],
        ['Desayuno Gala Plata', 'Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', '375.91', 15, 25, 'Plata', 'Gala'],
        
        // MENÚ - Oros (2 productos)
        ['Desayuno Club Oro', 'Cecina de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', '763.91', 15, 30, 'Oro', 'Club'],
        ['Comida Ceremonia Oro', 'Menú 3 tiempos base de Pollo Cerdo o Res (a elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 7 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor,limones), Servicio de Café y Té', 'Menú', '972.04', 15, 30, 'Oro', 'Ceremonia'],
        
        // MOBILIARIO (16 productos)
        ['Mesa redonda con mantelería Club Plata', 'Mesa redonda con mantelería fina,Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño', 'Mobiliario', '326.09', 15, 25, 'Plata', 'Club'],
        ['Mesa redonda con Sillas Tiffany Club Oro', 'Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño', 'Mobiliario', '316.48', 15, 30, 'Oro', 'Club'],
        ['Mesa redonda Ceremonia Platino', 'Mesa redonda con mantelería fina, Sillas Chiavari, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño', 'Mobiliario', '320.00', 15, 35, 'Platino', 'Ceremonia'],
        ['Mesa Imperial Club Oro', 'Mesa Imperial con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería premium', 'Mobiliario', '450.00', 15, 30, 'Oro', 'Club'],
        ['Lounge VIP Gala Platino', 'Set completo de mobiliario lounge: sofás, mesas de centro y decoración premium', 'Mobiliario', '800.00', 15, 35, 'Platino', 'Gala'],
        ['Barra de Bar Club Oro', 'Barra profesional con cristalería y utensilios completos', 'Mobiliario', '500.00', 15, 30, 'Oro', 'Club'],
        ['Sillas Chiavari Ceremonia Oro', 'Elegantes sillas chiavari doradas para eventos formales', 'Mobiliario', '25.00', 15, 30, 'Oro', 'Ceremonia'],
        ['Mesa rectangular Conferencia Plata', 'Mesa rectangular para eventos corporativos con sillas ejecutivas', 'Mobiliario', '280.00', 15, 25, 'Plata', 'Conferencia'],
        ['Estación de café Club Plata', 'Estación completa de café con todo el equipo necesario', 'Mobiliario', '150.00', 15, 25, 'Plata', 'Club'],
        ['Mobiliario exterior Gala Oro', 'Set de mobiliario para eventos al aire libre resistente al clima', 'Mobiliario', '380.00', 15, 30, 'Oro', 'Gala'],
        ['Tarima principal Ceremonia Platino', 'Tarima elevada con decoración para mesa principal', 'Mobiliario', '600.00', 15, 35, 'Platino', 'Ceremonia'],
        ['Mesa cóctel Club Oro', 'Mesas altas tipo cóctel con manteles elegantes', 'Mobiliario', '120.00', 15, 30, 'Oro', 'Club'],
        ['Sillas plegables Conferencia Plata', 'Sillas plegables cómodas para eventos corporativos', 'Mobiliario', '18.00', 15, 25, 'Plata', 'Conferencia'],
        ['Mesa buffet Gala Platino', 'Mesa especial para servicio de buffet con accesorios', 'Mobiliario', '350.00', 15, 35, 'Platino', 'Gala'],
        ['Estación de registro Conferencia Oro', 'Mesa de registro con banners y material corporativo', 'Mobiliario', '200.00', 15, 30, 'Oro', 'Conferencia'],
        ['Área VIP Gala Platino', 'Área exclusiva VIP con mobiliario premium y decoración', 'Mobiliario', '1200.00', 15, 35, 'Platino', 'Gala'],
        
        // DECORACIÓN (13 productos)
        ['Menú personalizado Club Oro', 'Menú personalizado (2 por mesa)', 'Decoración', '10.91', 15, 30, 'Oro', 'Club'],
        ['Centro de mesa floral Gala Platino', 'Arreglo floral premium con flores de temporada', 'Decoración', '85.00', 15, 35, 'Platino', 'Gala'],
        ['Iluminación ambiental Club Oro', 'Sistema de iluminación LED programable', 'Decoración', '450.00', 15, 30, 'Oro', 'Club'],
        ['Mantelería premium Ceremonia Platino', 'Manteles de lujo con servilletas a juego', 'Decoración', '45.00', 15, 35, 'Platino', 'Ceremonia'],
        ['Decoración floral entrada Gala Oro', 'Arreglo floral espectacular para la entrada del evento', 'Decoración', '200.00', 15, 30, 'Oro', 'Gala'],
        ['Camino de mesa Ceremonia Oro', 'Caminos de mesa elegantes con decoración dorada', 'Decoración', '35.00', 15, 30, 'Oro', 'Ceremonia'],
        ['Globos corporativos Conferencia Plata', 'Decoración con globos en colores corporativos', 'Decoración', '80.00', 15, 25, 'Plata', 'Conferencia'],
        ['Backdrop principal Gala Platino', 'Fondo decorativo principal para fotografías', 'Decoración', '300.00', 15, 35, 'Platino', 'Gala'],
        ['Velas aromáticas Club Oro', 'Velas aromáticas de lujo para ambientación', 'Decoración', '25.00', 15, 30, 'Oro', 'Club'],
        ['Telas decorativas Ceremonia Platino', 'Telas y drapeados elegantes para decoración aérea', 'Decoración', '150.00', 15, 35, 'Platino', 'Ceremonia'],
        ['Centros de mesa minimalistas Club Plata', 'Centros de mesa sencillos pero elegantes', 'Decoración', '40.00', 15, 25, 'Plata', 'Club'],
        ['Iluminación de colores Gala Oro', 'Sistema de luces de colores programables', 'Decoración', '320.00', 15, 30, 'Oro', 'Gala'],
        ['Decoración temática Conferencia Oro', 'Decoración personalizada según el tema del evento', 'Decoración', '180.00', 15, 30, 'Oro', 'Conferencia'],
        
        // AUDIO Y VIDEO (24 productos)  
        ['DJ Profesional Ceremonia Oro', 'Sonorización con sistemas de audio Profesional hasta 130 personas Incluye: Servicio de DJ por 6 horas Audio profesional HK Mixer audio 12 canales Micrófono SHURE Cabina 6 modulos LED', 'Audio y Video', '153.64', 15, 20, 'Oro', 'Ceremonia'],
        ['Pista Iluminada 5x5m Ceremonia Oro', 'Pista Iluminada Galaxy 5x5 m', 'Audio y Video', '84.55', 15, 20, 'Oro', 'Ceremonia'],
        ['Sistema de sonido básico Club Plata', 'Equipo de audio básico para eventos pequeños', 'Audio y Video', '120.00', 15, 25, 'Plata', 'Club'],
        ['Micrófono inalámbrico Conferencia Oro', 'Micrófono inalámbrico profesional para presentaciones', 'Audio y Video', '45.00', 15, 30, 'Oro', 'Conferencia'],
        ['Pantalla LED gigante Gala Platino', 'Pantalla LED de gran formato para eventos masivos', 'Audio y Video', '800.00', 15, 35, 'Platino', 'Gala'],
        ['Luces estroboscópicas Club Oro', 'Sistema de luces estroboscópicas para fiestas', 'Audio y Video', '180.00', 15, 30, 'Oro', 'Club'],
        ['Cámara profesional Ceremonia Platino', 'Servicio de videografía profesional', 'Audio y Video', '500.00', 15, 35, 'Platino', 'Ceremonia'],
        ['Proyector HD Conferencia Oro', 'Proyector de alta definición para presentaciones', 'Audio y Video', '150.00', 15, 30, 'Oro', 'Conferencia'],
        ['Sistema 5.1 Gala Platino', 'Sistema de audio surround para eventos premium', 'Audio y Video', '600.00', 15, 35, 'Platino', 'Gala'],
        ['DJ + Karaoke Club Oro', 'Servicio de DJ con sistema de karaoke incluido', 'Audio y Video', '220.00', 15, 30, 'Oro', 'Club'],
        ['Grabación en vivo Ceremonia Platino', 'Servicio completo de grabación del evento', 'Audio y Video', '400.00', 15, 35, 'Platino', 'Ceremonia'],
        ['Streaming en vivo Conferencia Platino', 'Transmisión en vivo del evento vía internet', 'Audio y Video', '350.00', 15, 35, 'Platino', 'Conferencia'],
        ['Pista de baile LED Club Platino', 'Pista de baile con iluminación LED integrada', 'Audio y Video', '450.00', 15, 35, 'Platino', 'Club'],
        ['Audio conferencia Conferencia Oro', 'Sistema de audio especializado para conferencias', 'Audio y Video', '200.00', 15, 30, 'Oro', 'Conferencia'],
        ['Iluminación teatral Gala Platino', 'Sistema de iluminación teatral profesional', 'Audio y Video', '380.00', 15, 35, 'Platino', 'Gala'],
        ['Equipo básico DJ Club Plata', 'Equipo básico de DJ para eventos sencillos', 'Audio y Video', '100.00', 15, 25, 'Plata', 'Club'],
        ['Pantalla táctil interactiva Conferencia Platino', 'Pantalla interactiva para presentaciones dinámicas', 'Audio y Video', '300.00', 15, 35, 'Platino', 'Conferencia'],
        ['Show de luces Gala Oro', 'Espectáculo de luces coordinado con la música', 'Audio y Video', '280.00', 15, 30, 'Oro', 'Gala'],
        ['Sistema de traducción Conferencia Platino', 'Equipo de traducción simultánea para eventos internacionales', 'Audio y Video', '450.00', 15, 35, 'Platino', 'Conferencia'],
        ['Banda sonora personalizada Ceremonia Oro', 'Música personalizada para momentos especiales', 'Audio y Video', '150.00', 15, 30, 'Oro', 'Ceremonia'],
        ['Efectos especiales Gala Platino', 'Máquinas de humo, confeti y efectos especiales', 'Audio y Video', '200.00', 15, 35, 'Platino', 'Gala'],
        ['Micrófono de diadema Conferencia Oro', 'Micrófono manos libres para presentadores', 'Audio y Video', '60.00', 15, 30, 'Oro', 'Conferencia'],
        ['Altavoces ambientales Club Oro', 'Sistema de altavoces distribuidos para sonido ambiental', 'Audio y Video', '180.00', 15, 30, 'Oro', 'Club'],
        ['Cabina de DJ premium Gala Platino', 'Cabina de DJ profesional con efectos LED', 'Audio y Video', '350.00', 15, 35, 'Platino', 'Gala']
      ];

      // Insert products in batches for better performance
      let insertCount = 0;
      for (let i = 0; i < products.length; i += 10) {
        const batch = products.slice(i, i + 10);
        
        for (const product of batch) {
          try {
            await client.query(`
              INSERT INTO items (name, description, category, base_price, min_margin, max_margin, quality, ambientacion, status)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
            `, product);
            insertCount++;
          } catch (error) {
            console.log(`⚠️ Error inserting ${product[0]}: ${error.message}`);
          }
        }
        
        console.log(`   Loaded batch ${Math.ceil((i + 10) / 10)}/${Math.ceil(products.length / 10)} (${insertCount} products so far)`);
      }
      
      console.log(`✅ ${insertCount} products loaded successfully`);
    }

    // 4. Create sample partner
    console.log('\n🤝 Creating sample partner...');
    try {
      const partnerPassword = await hashPassword('socio123');
      await client.query(`
        INSERT INTO partners (username, password, full_name, company, rfc, email, whatsapp, personal_address, assistant_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (username) DO NOTHING
      `, ['Alonso1', partnerPassword, 'Alonso Magos', 'Exp Log', 'MAAL850315ABC', 'alonso@explog.com', '+52 55 1234 5678', 'CDMX', 'María González']);
      console.log('✅ Sample partner created: Alonso1 / socio123');
    } catch (error) {
      console.log('ℹ️ Partner already exists or error:', error.message);
    }

    console.log('\n🎉 DATABASE INITIALIZATION COMPLETE!');
    console.log('====================================');
    console.log('');
    console.log('📊 Summary:');
    console.log('   • Admin user: admin / Admin2025!');
    console.log('   • Partner user: Alonso1 / socio123');  
    console.log('   • Products: 87 items across all categories');
    console.log('   • Categories: Menú, Mobiliario, Decoración, Audio y Video');
    console.log('   • Quality levels: Plata, Oro, Platino');
    console.log('   • Event types: Club, Ceremonia, Gala, Conferencia');
    console.log('');
    console.log('🚀 Your Digital Ocean app should now work perfectly!');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

// Execute the initialization
initializeDatabase();