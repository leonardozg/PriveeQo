import { storage } from '../server/storage.js';

async function createUsers() {
  try {
    console.log('🔐 Creando usuarios directamente...');
    
    // Crear admin
    const admin = await storage.createAdminUser({
      username: 'admin',
      password: 'Admin2025!'
    });
    console.log('✅ Admin creado:', admin.username);
    
    // Crear partner
    const partner = await storage.createPartner({
      username: 'Alonso1',
      password: 'socio123',
      fullName: 'Alonso Magos',
      company: 'Exp Log',
      rfc: 'XAXX010101000',
      email: 'alonso@explog.com',
      whatsapp: '+525551234567',
      personalAddress: 'Ciudad de México, CDMX',
      assistantName: 'María González',
      isActive: true
    });
    console.log('✅ Partner creado:', partner.username);
    
    console.log('🎉 Usuarios creados exitosamente!');
    console.log('📋 Credenciales:');
    console.log('   Admin: admin / Admin2025!');
    console.log('   Partner: Alonso1 / socio123');
    
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  }
}

createUsers();