// Para Node.js 18+ fetch está incluido globalmente

const API_BASE = 'http://localhost:5000/api';

// Obtener lista de socios y productos existentes
async function getExistingData() {
  const [partnersRes, itemsRes] = await Promise.all([
    fetch(`${API_BASE}/partners`),
    fetch(`${API_BASE}/items`)
  ]);
  
  const partners = await partnersRes.json();
  const items = await itemsRes.json();
  
  return { partners, items };
}

// Función para generar cotizaciones de ejemplo
function generateSampleQuotes(partners, items) {
  const sampleQuotes = [
    {
      clientName: "Corporativo ABC",
      clientEmail: "eventos@corporativoabc.com",
      clientCompany: "ABC Corporation",
      projectName: "Evento de Fin de Año 2024",
      status: "sent",
      items: [
        { itemId: items.find(i => i.name.includes("Sillas"))?.id, margin: 30 },
        { itemId: items.find(i => i.name.includes("Mesas"))?.id, margin: 25 },
        { itemId: items.find(i => i.name.includes("Audio"))?.id, margin: 35 }
      ]
    },
    {
      clientName: "Fundación XYZ",
      clientEmail: "coordinacion@fundacionxyz.org",
      clientCompany: "Fundación XYZ",
      projectName: "Gala Benéfica Anual",
      status: "accepted",
      items: [
        { itemId: items.find(i => i.name.includes("Centro de Mesa"))?.id, margin: 40 },
        { itemId: items.find(i => i.name.includes("Iluminación"))?.id, margin: 30 },
        { itemId: items.find(i => i.name.includes("Fuegos"))?.id, margin: 50 }
      ]
    },
    {
      clientName: "Tech Innovators",
      clientEmail: "events@techinnovators.com",
      clientCompany: "Tech Innovators S.A.",
      projectName: "Conferencia Tecnológica 2025",
      status: "draft",
      items: [
        { itemId: items.find(i => i.name.includes("Pantalla"))?.id, margin: 25 },
        { itemId: items.find(i => i.name.includes("Coffee"))?.id, margin: 35 },
        { itemId: items.find(i => i.name.includes("Backdrop"))?.id, margin: 20 }
      ]
    },
    {
      clientName: "Hotel Premier",
      clientEmail: "bodas@hotelpremier.mx",
      clientCompany: "Hotel Premier",
      projectName: "Boda de Lujo - Jardín Principal",
      status: "sent",
      items: [
        { itemId: items.find(i => i.name.includes("Lounge"))?.id, margin: 45 },
        { itemId: items.find(i => i.name.includes("DJ"))?.id, margin: 30 },
        { itemId: items.find(i => i.name.includes("Fotografia"))?.id, margin: 35 }
      ]
    },
    {
      clientName: "Escuela Internacional",
      clientEmail: "direccion@escuelaint.edu.mx",
      clientCompany: "Escuela Internacional de México",
      projectName: "Graduación 2024",
      status: "rejected",
      items: [
        { itemId: items.find(i => i.name.includes("Certificados"))?.id, margin: 50 },
        { itemId: items.find(i => i.name.includes("Video"))?.id, margin: 40 }
      ]
    }
  ];

  return sampleQuotes;
}

// Función para calcular precios y crear cotización
async function createQuote(quoteData, partner, items) {
  let subtotal = 0;
  let totalMargin = 0;
  
  const quoteItems = quoteData.items
    .filter(item => item.itemId) // Solo procesar items que existen
    .map(item => {
      const product = items.find(p => p.id === item.itemId);
      if (!product) return null;
      
      const basePrice = parseFloat(product.basePrice);
      const marginPercent = item.margin;
      const marginAmount = (basePrice * marginPercent) / 100;
      const totalPrice = basePrice + marginAmount;
      
      subtotal += basePrice;
      totalMargin += marginAmount;
      
      return {
        quoteId: "", // Se asignará automáticamente por el backend
        itemId: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        margin: marginPercent,
        marginAmount: marginAmount.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
      };
    })
    .filter(Boolean); // Remover nulls

  const tax = 0; // Sin IVA para este ejemplo
  const total = subtotal + totalMargin + tax;

  const quote = {
    clientName: quoteData.clientName,
    clientEmail: quoteData.clientEmail,
    clientCompany: quoteData.clientCompany,
    projectName: quoteData.projectName,
    partnerName: partner.fullName,
    partnerEmail: partner.email,
    partnerCompany: partner.company,
    subtotal: subtotal.toFixed(2),
    totalMargin: totalMargin.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
    status: quoteData.status,
    terms: "• Reserva con 5,000 pesos\n• Se requiere del 50% de anticipo para confirmación de fecha\n• Finiquito de 20 días hábiles antes del evento\n• Se solicita un mínimo de 100 personas para respetar los costos antes mencionados, en caso de ser menos invitados se tendrá que hacer un ajuste\n• Cotización válida por 30 días desde la fecha de emisión\n• Revisiones adicionales fuera del alcance pueden generar cargos extra"
  };

  return { quote, items: quoteItems };
}

async function seedQuotes() {
  console.log('🎯 Iniciando carga de cotizaciones de ejemplo...');
  
  try {
    // Obtener datos existentes
    const { partners, items } = await getExistingData();
    
    if (partners.length === 0) {
      console.log('❌ No hay socios registrados. Ejecuta el script de datos primero.');
      return;
    }
    
    if (items.length === 0) {
      console.log('❌ No hay productos registrados. Ejecuta el script de datos primero.');
      return;
    }

    // Generar cotizaciones de ejemplo
    const sampleQuotes = generateSampleQuotes(partners, items);
    let createdCount = 0;

    for (let i = 0; i < sampleQuotes.length; i++) {
      const quoteData = sampleQuotes[i];
      const partner = partners[i % partners.length]; // Rotar socios
      
      try {
        const { quote, items: quoteItems } = await createQuote(quoteData, partner, items);
        
        const response = await fetch(`${API_BASE}/quotes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quote, items: quoteItems })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Cotización creada: ${quote.projectName} (${quote.status})`);
          createdCount++;
        } else {
          const error = await response.text();
          console.log(`❌ Error creando cotización: ${quote.projectName} - ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error procesando cotización: ${quoteData.projectName} - ${error.message}`);
      }
    }

    console.log('\n🎉 ¡Carga de cotizaciones completada!');
    console.log(`📊 Resumen:`);
    console.log(`   • ${createdCount} cotizaciones creadas`);
    console.log(`   • Estados: draft, sent, accepted, rejected`);
    console.log(`   • Valores monetarios realistas`);
    console.log(`   • Datos listos para indicadores del panel`);
    
  } catch (error) {
    console.error('❌ Error durante la carga:', error);
  }
}

// Ejecutar automáticamente
seedQuotes();