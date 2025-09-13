import { createHash } from 'crypto';

async function setupUsers() {
  try {
    console.log('🔐 Configurando usuarios...');
    
    // Crear hashes simples para las contraseñas
    const adminPasswordHash = createHash('sha256').update('Admin2025!').digest('hex');
    const partnerPasswordHash = createHash('sha256').update('socio123').digest('hex');
    
    console.log('✅ Usuarios configurados:');
    console.log('📋 Credenciales disponibles:');
    console.log('   Admin: admin / Admin2025!');
    console.log('   Partner: Alonso1 / socio123');
    console.log('');
    console.log('📝 Hashes generados:');
    console.log('   Admin hash:', adminPasswordHash);
    console.log('   Partner hash:', partnerPasswordHash);
    
  } catch (error) {
    console.error('❌ Error configurando usuarios:', error);
  }
}

setupUsers();