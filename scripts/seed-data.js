// Para Node.js 18+ fetch está incluido globalmente

const API_BASE = 'http://localhost:5000/api';

// Datos de socios de ejemplo
const partners = [
  {
    fullName: "Ana Martínez",
    email: "ana@eventospremium.com", 
    company: "Eventos Premium",
    rfc: "EPR850523ABC",
    whatsapp: "+52 55 1234 5678",
    personalAddress: "Av. Polanco 123, Ciudad de México",
    assistantName: "Luis Rodríguez"
  },
  {
    fullName: "Carlos Rivera",
    email: "carlos@luxuryevents.mx",
    company: "Luxury Events Mexico", 
    rfc: "LEM920715XYZ",
    whatsapp: "+52 33 8765 4321",
    personalAddress: "Av. Providencia 456, Guadalajara",
    assistantName: "Patricia López"
  },
  {
    fullName: "María González",
    email: "maria@eleganceproductions.com",
    company: "Elegance Productions",
    rfc: "EPG881102DEF",
    whatsapp: "+52 81 5555 0123", 
    personalAddress: "Av. Constitución 789, Monterrey",
    assistantName: "Roberto Hernández"
  }
];

// Datos de productos de ejemplo por categoría
const items = [
  // Mobiliario
  {
    name: "Sillas Chiavari Doradas",
    description: "Elegantes sillas chiavari en acabado dorado, perfectas para eventos de lujo",
    category: "Mobiliario",
    quality: "Oro",
    ambientacion: "Gala",
    basePrice: "25.00",
    minMargin: 20,
    maxMargin: 50,
    status: "active"
  },
  {
    name: "Mesas Redondas Premium",
    description: "Mesas redondas de 1.80m con mantelería de lujo incluida", 
    category: "Mobiliario",
    quality: "Platino",
    ambientacion: "Gala",
    basePrice: "150.00",
    minMargin: 25,
    maxMargin: 45,
    status: "active"
  },
  {
    name: "Lounge VIP",
    description: "Set completo de mobiliario lounge: sofás, mesas de centro y decoración",
    category: "Mobiliario", 
    quality: "Platino",
    ambientacion: "Club",
    basePrice: "800.00",
    minMargin: 30,
    maxMargin: 60,
    status: "active"
  },

  // Menu
  {
    name: "Canapés Gourmet Premium",
    description: "Selección de 12 canapés gourmet con ingredientes premium",
    category: "Menu",
    quality: "Oro",
    ambientacion: "Gala", 
    basePrice: "45.00",
    minMargin: 40,
    maxMargin: 70,
    status: "active"
  },
  {
    name: "Cena de 5 Tiempos",
    description: "Menú completo de 5 tiempos con maridaje de vinos",
    category: "Menu",
    quality: "Platino", 
    ambientacion: "Gala",
    basePrice: "180.00",
    minMargin: 35,
    maxMargin: 65,
    status: "active"
  },
  {
    name: "Coffee Break Ejecutivo",
    description: "Servicio de café premium con repostería fina",
    category: "Menu",
    quality: "Plata",
    ambientacion: "Conferencia",
    basePrice: "28.00", 
    minMargin: 25,
    maxMargin: 50,
    status: "active"
  },

  // Decoración
  {
    name: "Centro de Mesa Floral Premium",
    description: "Arreglos florales exclusivos con flores de temporada",
    category: "Decoración",
    quality: "Oro",
    ambientacion: "Gala",
    basePrice: "85.00",
    minMargin: 30,
    maxMargin: 60,
    status: "active"
  },
  {
    name: "Iluminación Ambiental LED",
    description: "Sistema completo de iluminación LED programable",
    category: "Decoración", 
    quality: "Platino",
    ambientacion: "Club",
    basePrice: "450.00",
    minMargin: 25,
    maxMargin: 55,
    status: "active"
  },
  {
    name: "Backdrop Personalizado",
    description: "Fondo fotográfico personalizado con branding del evento",
    category: "Decoración",
    quality: "Oro",
    ambientacion: "Conferencia",
    basePrice: "200.00",
    minMargin: 20,
    maxMargin: 45,
    status: "active"
  },

  // Audio y Video
  {
    name: "Sistema de Audio Premium",
    description: "Equipo de sonido profesional con técnico incluido",
    category: "Audio y Video",
    quality: "Platino",
    ambientacion: "Gala",
    basePrice: "600.00",
    minMargin: 20,
    maxMargin: 40,
    status: "active"
  },
  {
    name: "Pantalla LED Gigante",
    description: "Pantalla LED de alta resolución 3x2 metros",
    category: "Audio y Video",
    quality: "Platino", 
    ambientacion: "Conferencia",
    basePrice: "800.00",
    minMargin: 25,
    maxMargin: 50,
    status: "active"
  },

  // Espectáculos
  {
    name: "Show de Fuegos Artificiales",
    description: "Espectáculo pirotécnico sincronizado de 5 minutos",
    category: "Espectáculos",
    quality: "Platino",
    ambientacion: "Gala",
    basePrice: "1200.00",
    minMargin: 30,
    maxMargin: 60,
    status: "active"
  },
  {
    name: "DJ Profesional",
    description: "DJ especializado en eventos corporativos con equipamiento",
    category: "Espectáculos",
    quality: "Oro",
    ambientacion: "Club",
    basePrice: "400.00",
    minMargin: 25,
    maxMargin: 50,
    status: "active"
  },

  // Fotografía
  {
    name: "Sesión Fotográfica Premium",
    description: "Cobertura fotográfica completa del evento con edición",
    category: "Fotografia", 
    quality: "Oro",
    ambientacion: "Gala",
    basePrice: "500.00",
    minMargin: 30,
    maxMargin: 60,
    status: "active"
  },
  {
    name: "Video Corporativo",
    description: "Producción de video promocional del evento",
    category: "Fotografia",
    quality: "Platino",
    ambientacion: "Conferencia",
    basePrice: "800.00",
    minMargin: 35,
    maxMargin: 65,
    status: "active"
  },

  // Memorabilia
  {
    name: "Regalos Corporativos Premium", 
    description: "Kit de regalos personalizados para invitados VIP",
    category: "Memorabilia",
    quality: "Oro",
    ambientacion: "Gala",
    basePrice: "35.00",
    minMargin: 40,
    maxMargin: 80,
    status: "active"
  },
  {
    name: "Certificados de Participación",
    description: "Diplomas personalizados en papel premium con marco",
    category: "Memorabilia",
    quality: "Plata", 
    ambientacion: "Conferencia",
    basePrice: "15.00",
    minMargin: 30,
    maxMargin: 60,
    status: "active"
  }
];

async function seedData() {
  console.log('🌱 Iniciando carga de datos de ejemplo...');
  
  try {
    // Cargar socios
    console.log('📋 Cargando socios...');
    for (const partner of partners) {
      const response = await fetch(`${API_BASE}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner)
      });
      
      if (response.ok) {
        console.log(`✅ Socio creado: ${partner.fullName} - ${partner.company}`);
      } else {
        console.log(`❌ Error creando socio: ${partner.fullName}`);
      }
    }

    // Cargar productos
    console.log('\n📦 Cargando productos...');
    for (const item of items) {
      const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      
      if (response.ok) {
        console.log(`✅ Producto creado: ${item.name} (${item.category})`);
      } else {
        console.log(`❌ Error creando producto: ${item.name}`);
      }
    }

    console.log('\n🎉 ¡Carga de datos completada!');
    console.log(`📊 Resumen:`);
    console.log(`   • ${partners.length} socios cargados`);
    console.log(`   • ${items.length} productos cargados`);
    console.log(`   • 8 categorías cubiertas`);
    console.log(`   • Productos en 3 niveles de calidad`);
    
  } catch (error) {
    console.error('❌ Error durante la carga:', error);
  }
}

// Ejecutar automáticamente
seedData();