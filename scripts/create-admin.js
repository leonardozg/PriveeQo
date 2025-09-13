import { hash } from 'scrypt';

// Crear el usuario administrador
async function createAdmin() {
  try {
    const hashedPassword = await hash('Admin2025!', { N: 16384, r: 8, p: 1 });
    
    console.log('Usuario: admin');
    console.log('Contraseña: Admin2025!');
    console.log('Hash:', hashedPassword.toString('base64'));
    
    // Datos que se pueden insertar directamente
    const adminData = {
      username: 'admin',
      password: hashedPassword.toString('base64'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Datos de admin:', JSON.stringify(adminData, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();