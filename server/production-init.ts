import { db } from './db';
import { items, adminUsers, partners } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString('hex')}.${salt}`;
}

export async function initializeProductionDatabase() {
  try {
    console.log('🔄 Inicializando base de datos para producción...');

    // 1. Crear usuario administrador por defecto
    try {
      const adminPassword = await hashPassword('Admin2025!');
      await db.insert(adminUsers).values({
        username: 'admin',
        password: adminPassword
      }).onConflictDoNothing();
      console.log('✅ Usuario admin creado');
    } catch (error) {
      console.log('ℹ️ Usuario admin ya existe');
    }

    // 2. Verificar si ya hay productos
    const existingItems = await db.select().from(items).limit(1);
    if (existingItems.length > 0) {
      console.log('ℹ️ Productos ya cargados');
      return;
    }

    // 3. Cargar productos desde datos embebidos
    const productionItems = [
      // MENÚ - Desayunos
      {
        name: "Desayuno Club Plata",
        description: "Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado",
        category: "Menú" as const,
        quality: "Plata" as const,
        ambientacion: "Club" as const,
        basePrice: "760.87",
        minMargin: 15,
        maxMargin: 25,
        status: "active" as const
      },
      {
        name: "Desayuno Ceremonia Plata",
        description: "Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado",
        category: "Menú" as const,
        quality: "Plata" as const,
        ambientacion: "Ceremonia" as const,
        basePrice: "762.00",
        minMargin: 15,
        maxMargin: 25,
        status: "active" as const
      },
      {
        name: "Desayuno Gala Plata",
        description: "Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado",
        category: "Menú" as const,
        quality: "Plata" as const,
        ambientacion: "Gala" as const,
        basePrice: "375.91",
        minMargin: 15,
        maxMargin: 25,
        status: "active" as const
      },
      // MENÚ - Oro
      {
        name: "Desayuno Club Oro",
        description: "Cecina de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado",
        category: "Menú" as const,
        quality: "Oro" as const,
        ambientacion: "Club" as const,
        basePrice: "763.91",
        minMargin: 15,
        maxMargin: 30,
        status: "active" as const
      },
      {
        name: "Comida Ceremonia Oro",
        description: "Menú 3 tiempos base de Pollo Cerdo o Res (a elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 7 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor,limones), Servicio de Café y Té",
        category: "Menú" as const,
        quality: "Oro" as const,
        ambientacion: "Ceremonia" as const,
        basePrice: "972.04",
        minMargin: 15,
        maxMargin: 30,
        status: "active" as const
      },
      // MOBILIARIO
      {
        name: "Mesa redonda con mantelería Club Plata",
        description: "Mesa redonda con mantelería fina,Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
        category: "Mobiliario" as const,
        quality: "Plata" as const,
        ambientacion: "Club" as const,
        basePrice: "326.09",
        minMargin: 15,
        maxMargin: 25,
        status: "active" as const
      },
      {
        name: "Mesa redonda con Sillas Tiffany Club Oro",
        description: "Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
        category: "Mobiliario" as const,
        quality: "Oro" as const,
        ambientacion: "Club" as const,
        basePrice: "316.48",
        minMargin: 15,
        maxMargin: 30,
        status: "active" as const
      },
      // DECORACIÓN
      {
        name: "Menú personalizado Club Oro",
        description: "Menú personalizado (2 por mesa)",
        category: "Decoración" as const,
        quality: "Oro" as const,
        ambientacion: "Club" as const,
        basePrice: "10.91",
        minMargin: 15,
        maxMargin: 30,
        status: "active" as const
      },
      // AUDIO Y VIDEO
      {
        name: "DJ Profesional Ceremonia Oro",
        description: "Sonorización con sistemas de audio Profesional hasta 130 personas Incluye: Servicio de DJ por 6 horas Audio profesional HK Mixer audio 12 canales Micrófono SHURE Cabina 6 modulos LED",
        category: "Audio y Video" as const,
        quality: "Oro" as const,
        ambientacion: "Ceremonia" as const,
        basePrice: "153.64",
        minMargin: 15,
        maxMargin: 20,
        status: "active" as const
      },
      {
        name: "Pista Iluminada 5x5m Ceremonia Oro",
        description: "Pista Iluminada Galaxy 5x5 m",
        category: "Audio y Video" as const,
        quality: "Oro" as const,
        ambientacion: "Ceremonia" as const,
        basePrice: "84.55",
        minMargin: 15,
        maxMargin: 20,
        status: "active" as const
      }
    ];

    // Insertar productos de muestra
    await db.insert(items).values(productionItems);
    console.log(`✅ ${productionItems.length} productos base cargados`);

    // 4. Crear partner de ejemplo
    const partnerPassword = await hashPassword('socio123');
    await db.insert(partners).values({
      username: 'Alonso1',
      password: partnerPassword,
      fullName: 'Alonso Magos',
      company: 'Exp Log',
      rfc: 'MAAL850315ABC',
      email: 'alonso@explog.com',
      whatsapp: '+52 55 1234 5678',
      personalAddress: 'CDMX',
      assistantName: 'María González'
    }).onConflictDoNothing();
    console.log('✅ Partner de ejemplo creado');

    console.log('🎉 Base de datos inicializada correctamente para producción');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}