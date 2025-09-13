import type { QuoteWithItems } from "@shared/schema";

// Generate unique quote code based on partner and client info
export function generateQuoteCode(partnerName: string, clientName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
  const partnerInitials = partnerName.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  const clientInitials = clientName.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `COT-${timestamp}-${partnerInitials}${clientInitials}-${randomSuffix}`;
}

export function generateQuoteHTML(quote: QuoteWithItems): string {
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + 30);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización ${quote.quoteNumber} - PRIVEE</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #ffffff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            min-height: 100vh;
        }
        
        .header {
            background: #ffffff;
            color: #1a1a1a;
            padding: 2rem;
            border-bottom: 3px solid #1a1a1a;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            flex: 4;
        }
        
        .logo-container {
            width: 140px;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 2rem;
        }
        
        .logo-img {
            width: 140px;
            height: 140px;
            object-fit: contain;
        }
        
        .company-info h1 {
            font-size: 3.2rem;
            font-weight: bold;
            margin-bottom: 0.8rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-family: Arial, sans-serif;
        }
        
        .tagline {
            font-size: 1.1rem;
            font-style: italic;
            color: #666;
            margin-bottom: 1rem;
            line-height: 1.4;
        }
        
        .company-details {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }
        
        .quote-info {
            text-align: right;
            border: 1px solid #1a1a1a;
            padding: 0.8rem;
            background: #f9f9f9;
            min-width: 140px;
            flex-shrink: 0;
            flex: 0.8;
        }
        
        .quote-number {
            font-size: 0.95rem;
            font-weight: bold;
            margin-bottom: 0.3rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .quote-date {
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 0.2rem;
        }
        
        .validity-info {
            font-size: 0.75rem;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 0.3rem;
            margin-top: 0.3rem;
        }
        
        .content {
            padding: 2rem;
            clear: both;
        }
        
        .section {
            margin-bottom: 3rem;
        }
        
        .section-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #1a1a1a;
            padding-bottom: 0.5rem;
        }
        
        .client-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }
        
        .info-group h4 {
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 1rem;
            text-transform: uppercase;
            font-size: 1rem;
            letter-spacing: 0.5px;
        }
        
        .info-group p {
            color: #333;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
            background: white;
        }
        
        .items-table th {
            background: #1a1a1a;
            color: white;
            font-weight: bold;
            padding: 1.2rem;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.9rem;
        }
        
        .items-table td {
            padding: 1.2rem;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
        }
        
        .items-table tr:last-child td {
            border-bottom: 2px solid #1a1a1a;
        }
        
        .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .item-name {
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .item-description {
            color: #666;
            font-size: 0.9rem;
            line-height: 1.4;
            font-style: italic;
        }
        
        .price-cell {
            text-align: right;
            font-weight: bold;
            color: #1a1a1a;
            font-family: 'Courier New', monospace;
        }
        
        .margin-info {
            font-size: 0.8rem;
            color: #666;
            margin-top: 0.3rem;
        }
        
        .totals {
            background: #f9f9f9;
            border: 2px solid #1a1a1a;
            padding: 2rem;
            margin-top: 2rem;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 0;
            font-size: 1.1rem;
        }
        
        .total-row.final {
            border-top: 2px solid #1a1a1a;
            margin-top: 1rem;
            padding-top: 1.5rem;
            font-size: 1.3rem;
            font-weight: bold;
            color: #1a1a1a;
        }
        
        .total-label {
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .total-amount {
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        
        .validity {
            background: #f9f9f9;
            border: 2px solid #1a1a1a;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: center;
        }
        
        .validity-title {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
        }
        
        .terms {
            background: #f9f9f9;
            border-left: 5px solid #1a1a1a;
            padding: 2rem;
            margin: 2rem 0;
        }
        
        .terms h4 {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 1rem;
        }
        
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .footer-content {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .partner-info {
            margin-bottom: 1.5rem;
        }
        
        .partner-info h4 {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            font-size: 0.9rem;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        /* Tablet styles */
        @media (max-width: 1024px) {
            .container {
                margin: 0 1rem;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            
            .quote-info {
                max-width: 260px;
                font-size: 0.9rem;
            }
            
            .items-table th,
            .items-table td {
                padding: 1rem;
                font-size: 0.95rem;
            }
        }
        
        /* Mobile landscape */
        @media (max-width: 768px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header {
                padding: 1.5rem 1rem;
            }
            
            .header-top {
                flex-direction: column;
                gap: 1.5rem;
            }
            
            .logo-section {
                margin-bottom: 0;
            }
            
            .quote-info {
                text-align: center;
                width: 100%;
                min-width: auto;
                border: 2px solid #1a1a1a;
                background: #f9f9f9;
                padding: 1rem;
            }
            
            .quote-number {
                font-size: 1.5rem;
            }
            
            .content {
                padding: 1.5rem 1rem;
            }
            
            .section {
                margin-bottom: 2rem;
            }
            
            .section-title {
                font-size: 1.2rem;
            }
            
            .client-info {
                grid-template-columns: 1fr;
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .items-table {
                font-size: 0.85rem;
                display: block;
                overflow-x: auto;
                white-space: nowrap;
                -webkit-overflow-scrolling: touch;
            }
            
            .items-table th,
            .items-table td {
                padding: 0.8rem 0.5rem;
                min-width: 120px;
            }
            
            .items-table th:first-child,
            .items-table td:first-child {
                min-width: 180px;
                white-space: normal;
            }
            
            .item-name {
                font-size: 0.9rem;
            }
            
            .item-description {
                font-size: 0.8rem;
                line-height: 1.3;
            }
            
            .price-cell {
                font-size: 0.85rem;
            }
            
            .totals {
                padding: 1.5rem;
            }
            
            .total-row {
                font-size: 1rem;
                padding: 0.6rem 0;
            }
            
            .total-row.final {
                font-size: 1.3rem;
            }
            
            .validity,
            .terms {
                padding: 1.5rem;
                margin: 1.5rem 0;
            }
            
            .footer {
                padding: 1.5rem;
            }
            
            .contact-info {
                grid-template-columns: 1fr;
                gap: 0.8rem;
                font-size: 0.85rem;
            }
        }
        
        /* Mobile portrait */
        @media (max-width: 480px) {
            .header {
                padding: 1rem;
            }
            
            .header-top {
                gap: 1rem;
            }
            
            .logo-section {
                flex-direction: column;
                align-items: center;
                text-align: center;
                margin-bottom: 0;
            }
            
            .logo-container {
                margin-right: 0;
                margin-bottom: 1rem;
                width: 100px;
                height: 100px;
            }
            
            .logo-img {
                width: 100px;
                height: 100px;
            }
            
            .company-info h1 {
                font-size: 2.5rem;
            }
            
            .tagline {
                font-size: 1rem;
            }
            
            .company-details {
                font-size: 0.85rem;
            }
            
            .quote-info {
                padding: 0.8rem;
            }
            
            .quote-number {
                font-size: 1.3rem;
                line-height: 1.2;
            }
            
            .quote-date,
            .validity-info {
                font-size: 0.8rem;
            }
            
            .content {
                padding: 1rem 0.8rem;
            }
            
            .section-title {
                font-size: 1.1rem;
                margin-bottom: 1rem;
            }
            
            .info-group h4 {
                font-size: 0.9rem;
                margin-bottom: 0.8rem;
            }
            
            .info-group p {
                font-size: 0.9rem;
                margin-bottom: 0.4rem;
            }
            
            .items-table {
                font-size: 0.8rem;
            }
            
            .items-table th,
            .items-table td {
                padding: 0.6rem 0.4rem;
            }
            
            .items-table th:first-child,
            .items-table td:first-child {
                min-width: 140px;
            }
            
            .item-name {
                font-size: 0.85rem;
                margin-bottom: 0.3rem;
            }
            
            .item-description {
                font-size: 0.75rem;
                line-height: 1.2;
            }
            
            .totals {
                padding: 1rem;
            }
            
            .total-row {
                font-size: 0.9rem;
            }
            
            .total-row.final {
                font-size: 1.1rem;
            }
            
            .validity-title {
                font-size: 0.9rem;
            }
            
            .validity,
            .terms {
                padding: 1rem;
                font-size: 0.9rem;
            }
            
            .terms h4 {
                font-size: 0.9rem;
                margin-bottom: 0.8rem;
            }
            
            .terms p {
                font-size: 0.85rem;
                line-height: 1.4;
                margin-bottom: 0.5rem;
            }
            
            .footer {
                padding: 1rem;
            }
            
            .partner-info h4 {
                font-size: 0.9rem;
            }
            
            .partner-info p {
                font-size: 0.85rem;
            }
            
            .contact-info {
                font-size: 0.8rem;
                gap: 0.6rem;
            }
            
            .contact-item {
                flex-direction: column;
                gap: 0.3rem;
                text-align: center;
            }
        }
        
        /* Very small screens */
        @media (max-width: 320px) {
            .company-info h1 {
                font-size: 1.5rem;
                letter-spacing: 0.5px;
            }
            
            .tagline {
                font-size: 0.9rem;
            }
            
            .quote-number {
                font-size: 1.1rem;
            }
            
            .section-title {
                font-size: 1rem;
            }
            
            .items-table th,
            .items-table td {
                padding: 0.5rem 0.3rem;
            }
            
            .totals,
            .validity,
            .terms {
                padding: 0.8rem;
            }
            
            .total-row.final {
                font-size: 1rem;
            }
        }
        
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
                max-width: none;
            }
            
            .header {
                background: white !important;
                -webkit-print-color-adjust: exact;
            }
            
            .totals, .validity, .terms {
                background: white !important;
                -webkit-print-color-adjust: exact;
            }
            
            .items-table th {
                background: #1a1a1a !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
            }
            
            .footer {
                background: #1a1a1a !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="header-top">
                <div class="logo-section">
                    <div class="logo-container">
                        <img src="/logo.jpg" alt="PRIVEE Logo" class="logo-img" />
                    </div>
                    <div class="company-info">
                        <h1>PRIVEE</h1>
                        <div class="tagline">Un Santuario para Experiencias Únicas e Inolvidables</div>
                    </div>
                </div>
                <div class="quote-info">
                    <div class="quote-number">Cotización<br>${quote.quoteNumber}</div>
                    <div class="quote-date">Fecha: ${formatDate(new Date(quote.createdAt!))}</div>
                    <div class="validity-info">Válida hasta: ${formatDate(validityDate)}</div>
                </div>
            </div>
        </header>
        
        <main class="content">
            <div class="section">
                <h2 class="section-title">Información del Evento</h2>
                <div class="client-info">
                    <div class="info-group">
                        <h4>Datos del Cliente</h4>
                        <p><strong>Nombre:</strong> ${quote.clientName}</p>
                        <p><strong>Email:</strong> ${quote.clientEmail}</p>
                        ${quote.clientCompany ? `<p><strong>Empresa:</strong> ${quote.clientCompany}</p>` : ''}
                        <p><strong>Evento:</strong> ${quote.projectName}</p>
                        ${quote.eventDate ? `<p><strong>Fecha tentativa:</strong> ${formatDate(new Date(quote.eventDate))}</p>` : ''}
                    </div>
                    <div class="info-group">
                        <h4>Socio Comercial</h4>
                        <p><strong>Nombre:</strong> ${quote.partnerName}</p>
                        <p><strong>Email:</strong> ${quote.partnerEmail}</p>
                        <p><strong>Empresa:</strong> ${quote.partnerCompany}</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Detalle de Servicios</h2>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Servicio</th>
                            <th style="text-align: right;">Precio por persona</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.items.map(item => `
                        <tr>
                            <td>
                                <div class="item-name">${item.name}</div>
                                <div class="item-description">${item.description}</div>
                            </td>
                            <td class="price-cell">
                                ${formatCurrency(parseFloat(item.totalPrice))}
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="totals">
                <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-amount">${formatCurrency(parseFloat(quote.subtotal))}</span>
                </div>
                <div class="total-row">
                    <span class="total-label">IVA (16%):</span>
                    <span class="total-amount">${formatCurrency(parseFloat(quote.subtotal) * 0.16)}</span>
                </div>
                <div class="total-row final">
                    <span class="total-label">Total General:</span>
                    <span class="total-amount">${formatCurrency(parseFloat(quote.subtotal) + (parseFloat(quote.subtotal) * 0.16))}</span>
                </div>
            </div>
            
            <div class="validity">
                <div class="validity-title">Vigencia de la Cotización</div>
                <p>Esta cotización es válida hasta el <strong>${formatDate(validityDate)}</strong> (30 días naturales desde la fecha de emisión)</p>
            </div>
            
            ${quote.terms ? `
            <div class="terms">
                <h4>Términos y Condiciones</h4>
                ${quote.terms.split('\n').map(term => term.trim() ? `<p>${term.trim()}</p>` : '').join('')}
            </div>
            ` : `
            <div class="terms">
                <h4>Términos y Condiciones</h4>
                <p>• El 50% del importe total será requerido como anticipo para confirmar la reserva</p>
                <p>• El saldo restante deberá liquidarse 7 días antes del evento</p>
                <p>• Eventos con menos de 50 invitados tienen un cargo mínimo adicional de $15,000 MXN</p>
                <p>• Los precios incluyen IVA y están sujetos a cambios sin previo aviso</p>
                <p>• Cualquier cambio posterior a la confirmación puede generar costos adicionales</p>
            </div>
            `}
        </main>
        
        <footer class="footer">
            <div class="footer-content">
                <div class="partner-info">
                    <h4>Contacto del Socio</h4>
                    <p>${quote.partnerName} - ${quote.partnerCompany}</p>
                </div>
                <div class="contact-info">
                    <div class="contact-item">
                        <span>📧</span>
                        <span>${quote.partnerEmail}</span>
                    </div>
                    <div class="contact-item">
                        <span>🏢</span>
                        <span>PRIVEE Eventos Exclusivos</span>
                    </div>
                    <div class="contact-item">
                        <span>📅</span>
                        <span>Generado: ${formatDate(new Date())}</span>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>
  `;
}

export function openQuoteInNewTab(quote: QuoteWithItems): void {
  const htmlContent = generateQuoteHTML(quote);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  
  // Clean up the blob URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}