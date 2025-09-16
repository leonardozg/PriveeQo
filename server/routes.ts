import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertItemSchema, insertQuoteSchema, insertQuoteItemSchema, insertAdminUserSchema, insertPartnerSchema, partnerLoginSchema, partnerPasswordChangeSchema, type QuoteWithItems, quoteItems, quotes, items, partners, adminUsers } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import { setupAuth, isAuthenticated } from "./auth";
import { db } from "./db";
import multer from "multer";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { execSync } from "child_process";
import * as path from "node:path";

// Professional quote HTML generator (server-side version)
function generateQuoteHTML(quote: QuoteWithItems): string {
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

  // HTML escape function to prevent XSS attacks
  const escapeHtml = (text: string | null | undefined): string => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
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
                    <div class="quote-number">Cotización<br>${escapeHtml(quote.quoteNumber)}</div>
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
                        <p><strong>Nombre:</strong> ${escapeHtml(quote.clientName)}</p>
                        <p><strong>Email:</strong> ${escapeHtml(quote.clientEmail)}</p>
                        ${quote.clientCompany ? `<p><strong>Empresa:</strong> ${escapeHtml(quote.clientCompany)}</p>` : ''}
                        <p><strong>Evento:</strong> ${escapeHtml(quote.projectName)}</p>
                        ${quote.eventDate ? `<p><strong>Fecha tentativa:</strong> ${formatDate(new Date(quote.eventDate))}</p>` : ''}
                    </div>
                    <div class="info-group">
                        <h4>Socio Comercial</h4>
                        <p><strong>Nombre:</strong> ${escapeHtml(quote.partnerName)}</p>
                        <p><strong>Email:</strong> ${escapeHtml(quote.partnerEmail)}</p>
                        <p><strong>Empresa:</strong> ${escapeHtml(quote.partnerCompany)}</p>
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
                                <div class="item-name">${escapeHtml(item.name)}</div>
                                <div class="item-description">${escapeHtml(item.description)}</div>
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
                ${quote.terms.split('\n').map(term => term.trim() ? `<p>${escapeHtml(term.trim())}</p>` : '').join('')}
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
                    <p>${escapeHtml(quote.partnerName)} - ${escapeHtml(quote.partnerCompany)}</p>
                </div>
                <div class="contact-info">
                    <div class="contact-item">
                        <span>📧</span>
                        <span>${escapeHtml(quote.partnerEmail)}</span>
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

// Middleware to check if partner is authenticated
function isPartnerAuthenticated(req: any, res: any, next: any) {
  if (req.session?.partnerId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔧 Iniciando registro de rutas...");
  // Session middleware for partners
  console.log("🔧 Configurando middleware de sesión...");
  app.use(session({
    secret: process.env.SESSION_SECRET || 'privee-default-session-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Setup platform-agnostic authentication middleware
  await setupAuth(app);

  // Partner Authentication Routes
  app.post('/api/partner/login', async (req: any, res) => {
    try {
      const validatedData = partnerLoginSchema.parse(req.body);
      const partner = await storage.authenticatePartner(validatedData.username, validatedData.password);
      
      if (!partner) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      
      // Set session
      req.session.partnerId = partner.id;
      req.session.partnerUsername = partner.username;
      
      // Remove password from response
      const { password, ...partnerWithoutPassword } = partner;
      res.json(partnerWithoutPassword);
    } catch (error: any) {
      console.error("Partner login error:", error);
      res.status(400).json({ message: error.message || "Error de autenticación" });
    }
  });

  app.post('/api/partner/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Sesión cerrada correctamente" });
    });
  });

  app.get('/api/partner/me', isPartnerAuthenticated, async (req: any, res) => {
    try {
      const partner = await storage.getPartner(req.session.partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Socio no encontrado" });
      }
      
      // Remove password from response
      const { password, ...partnerWithoutPassword } = partner;
      res.json(partnerWithoutPassword);
    } catch (error) {
      console.error("Error fetching partner:", error);
      res.status(500).json({ message: "Error al obtener información del socio" });
    }
  });

  app.post('/api/partner/change-password', isPartnerAuthenticated, async (req: any, res) => {
    try {
      const validatedData = partnerPasswordChangeSchema.parse(req.body);
      const success = await storage.changePartnerPassword(
        req.session.partnerUsername,
        validatedData.currentPassword,
        validatedData.newPassword
      );
      
      if (!success) {
        return res.status(400).json({ message: "Contraseña actual incorrecta" });
      }
      
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error: any) {
      console.error("Partner password change error:", error);
      res.status(400).json({ message: error.message || "Error al cambiar contraseña" });
    }
  });

  // Legacy authentication routes (kept for backwards compatibility)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get partner info for authenticated user
  app.get('/api/auth/partner', isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user.claims.email;
      if (!userEmail) {
        return res.status(400).json({ message: "User email not available" });
      }
      
      // Get partner profile by email
      const partner = await storage.getPartnerByEmail(userEmail);
      
      res.json(partner);
    } catch (error) {
      console.error("Error fetching partner:", error);
      res.status(500).json({ message: "Failed to fetch partner" });
    }
  });

  // Admin routes (separate authentication)
  app.get("/api/admin/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/admin/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/admin/quotes/stats", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      const now = new Date();
      
      // Calcular estadísticas
      const totalQuotes = quotes.length;
      const draftQuotes = quotes.filter(q => q.status === "draft").length;
      const sentQuotes = quotes.filter(q => q.status === "sent").length;
      const acceptedQuotes = quotes.filter(q => q.status === "accepted").length;
      const rejectedQuotes = quotes.filter(q => q.status === "rejected").length;
      
      // Calcular cotizaciones por mes actual
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const thisMonthQuotes = quotes.filter(q => {
        if (!q.createdAt) return false;
        const quoteDate = new Date(q.createdAt);
        return quoteDate.getMonth() === currentMonth && quoteDate.getFullYear() === currentYear;
      }).length;
      
      // Calcular valor total de cotizaciones aceptadas
      const totalValue = quotes
        .filter(q => q.status === "accepted")
        .reduce((sum, q) => sum + parseFloat(q.total), 0);
      
      res.json({
        totalQuotes,
        draftQuotes,
        sentQuotes, 
        acceptedQuotes,
        rejectedQuotes,
        thisMonthQuotes,
        totalValue,
        conversionRate: totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote stats" });
    }
  });

  app.post("/api/admin/items", async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put("/api/admin/items/:id", async (req, res) => {
    try {
      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/admin/items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Items routes (protected for partners)
  app.get("/api/partner/items", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Public items endpoint for listing all items
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    try {
      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Partner quotes routes (protected with new authentication)
  app.get("/api/partner/quotes", isPartnerAuthenticated, async (req, res) => {
    try {
      const partnerId = (req.session as any)?.partnerId;
      if (!partnerId) {
        return res.status(401).json({ message: "Partner not authenticated" });
      }
      
      // Get all quotes and filter by partner
      const allQuotes = await storage.getQuotes();
      const partnerQuotes = allQuotes.filter(quote => quote.partnerId === partnerId);
      
      res.json(partnerQuotes);
    } catch (error) {
      console.error("Error fetching partner quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Auto-expire quotes endpoint  
  app.post("/api/admin/expire-quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      let expiredCount = 0;
      
      // Find quotes that should be expired (sent status older than 30 days)
      for (const quote of quotes) {
        if (quote.status === "sent" && new Date(quote.createdAt!) < thirtyDaysAgo) {
          await storage.updateQuote(quote.id, { status: "expired" });
          expiredCount++;
          console.log(`⏰ Auto-expired quote: ${quote.quoteNumber}`);
        }
      }
      
      res.json({ 
        message: `Auto-expiration completed`,
        expiredQuotes: expiredCount 
      });
      
    } catch (error) {
      console.error("❌ Error auto-expiring quotes:", error);
      res.status(500).json({ message: "Failed to auto-expire quotes" });
    }
  });

  // Quote statistics for admin dashboard
  app.get("/api/quotes/stats", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      const now = new Date();
      
      // Calcular estadísticas
      const totalQuotes = quotes.length;
      const draftQuotes = quotes.filter(q => q.status === "draft").length;
      const sentQuotes = quotes.filter(q => q.status === "sent").length;
      const acceptedQuotes = quotes.filter(q => q.status === "accepted").length;
      const rejectedQuotes = quotes.filter(q => q.status === "rejected").length;
      
      // Calcular cotizaciones por mes actual
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const thisMonthQuotes = quotes.filter(q => {
        const quoteDate = new Date(q.createdAt!);
        return quoteDate.getMonth() === currentMonth && quoteDate.getFullYear() === currentYear;
      }).length;
      
      // Calcular valor total cotizado
      const totalQuoted = quotes.reduce((sum, quote) => {
        return sum + parseFloat(quote.total.toString());
      }, 0);
      
      // Valor de cotizaciones aceptadas
      const acceptedValue = quotes
        .filter(q => q.status === "accepted")
        .reduce((sum, quote) => sum + parseFloat(quote.total.toString()), 0);
      
      // Cotizaciones vigentes (últimos 30 días)
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const activeQuotes = quotes.filter(q => new Date(q.createdAt!) >= thirtyDaysAgo).length;
      
      // Cotizaciones vencidas (más de 30 días sin aceptar)
      const expiredQuotes = quotes.filter(q => {
        return new Date(q.createdAt!) < thirtyDaysAgo && q.status === "sent";
      }).length;
      
      res.json({
        totalQuotes,
        draftQuotes,
        sentQuotes,
        acceptedQuotes,
        rejectedQuotes,
        thisMonthQuotes,
        totalQuoted,
        acceptedValue,
        activeQuotes,
        expiredQuotes,
        conversionRate: sentQuotes > 0 ? ((acceptedQuotes / sentQuotes) * 100).toFixed(1) : "0"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote statistics" });
    }
  });

  // Generate unique quote code with partner folio system
  function generateQuoteCode(partnerName: string, clientName: string): string {
    // Get partner initials (first letters of first and last name)
    const partnerInitials = partnerName.split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // Get client initials (first letters of first and last name)
    const clientInitials = clientName.split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // Generate sequential folio number (simple counter for now)
    const folio = Date.now().toString().slice(-4); // Last 4 digits of timestamp as folio
    
    // Format: SOCIO-CLIENTE-FOLIO (as requested by user)
    return `${partnerInitials}-${clientInitials}-${folio}`;
  }

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  const createQuoteSchema = z.object({
    quote: insertQuoteSchema,
    items: z.array(insertQuoteItemSchema),
  });

  app.post("/api/partner/quotes", isPartnerAuthenticated, async (req, res) => {
    try {
      console.log("📝 Creating quote for partner:", (req.session as any).partnerUsername);
      console.log("📋 Quote data received:", JSON.stringify(req.body, null, 2));
      
      const { quote: quoteData, items: quoteItems } = req.body;
      
      if (!quoteData || !quoteItems) {
        console.log("❌ Missing quote data or items");
        return res.status(400).json({ message: "Quote data and items are required" });
      }
      
      // Generate unique quote code
      const quoteNumber = generateQuoteCode(quoteData.partnerName, quoteData.clientName);
      console.log("🔢 Generated quote number:", quoteNumber);
      
      // Get partner ID from session
      const partnerId = (req.session as any)?.partnerId;
      if (!partnerId) {
        return res.status(401).json({ message: "Partner not authenticated" });
      }
      
      // Validate quote data - keep as strings to match schema
      const validatedQuoteData = insertQuoteSchema.parse({
        ...quoteData,
        quoteNumber,
        partnerId,
        clientCompany: quoteData.clientCompany || null,
      });
      console.log("✅ Quote data validated");
      
      // Validate quote items - manually validate without quoteId
      const validatedQuoteItems = quoteItems.map((item: any) => ({
        itemId: item.itemId,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        margin: item.margin,
        marginAmount: item.marginAmount,
        totalPrice: item.totalPrice,
      }));
      console.log("✅ Quote items validated:", validatedQuoteItems.length, "items");
      
      const quote = await storage.createQuote(validatedQuoteData, validatedQuoteItems);
      console.log("✅ Quote created successfully:", quote.id);
      
      // Return quote with URL for sharing
      const shareUrl = `/quote/${quoteNumber}`;
      res.status(201).json({
        ...quote,
        shareUrl
      });
    } catch (error) {
      console.error("❌ Quote creation error:", error);
      if (error instanceof z.ZodError) {
        console.log("📋 Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  // Partner quote status update route
  app.patch("/api/partner/quotes/:id/status", isPartnerAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const quoteId = req.params.id;
      
      // Validate status
      const allowedPartnerStatuses = ["sent", "accepted", "rejected", "executed"];
      if (!allowedPartnerStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status", 
          allowedStatuses: allowedPartnerStatuses as string[] 
        });
      }
      
      // Get current quote to validate state transition
      const currentQuote = await storage.getQuote(quoteId);
      if (!currentQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Get partner ID from session and verify quote ownership
      const partnerId = (req.session as any)?.partnerId;
      if (!partnerId) {
        return res.status(401).json({ message: "Partner not authenticated" });
      }
      
      if (currentQuote.partnerId !== partnerId) {
        return res.status(403).json({ message: "Access denied. You can only update your own quotes." });
      }
      
      // Validate state transitions
      const validTransitions: Record<string, string[]> = {
        "draft": ["sent"],
        "sent": ["accepted", "rejected"],
        "accepted": ["executed"],
        "rejected": [], // Terminal state
        "executed": [], // Terminal state
        "expired": [] // Terminal state
      };
      
      const allowedNext = validTransitions[currentQuote.status] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status transition", 
          currentStatus: currentQuote.status,
          requestedStatus: status,
          allowedTransitions: allowedNext as string[]
        });
      }
      
      console.log(`🔄 Partner updating quote ${currentQuote.quoteNumber} from ${currentQuote.status} to ${status}`);
      
      // Update quote status
      const updatedQuote = await storage.updateQuote(quoteId, { status });
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json({ 
        message: "Quote status updated successfully",
        quote: updatedQuote 
      });
      
    } catch (error) {
      console.error("❌ Error updating quote status:", error);
      res.status(500).json({ message: "Failed to update quote status" });
    }
  });

  app.put("/api/quotes/:id", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.partial().parse(req.body);
      const quote = await storage.updateQuote(req.params.id, validatedData);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      // Get quote to check status before deleting
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // BUSINESS RULE: Only draft quotes can be deleted
      if (quote.status !== "draft") {
        return res.status(403).json({ 
          message: "Cannot delete quote", 
          reason: `Quotes with status '${quote.status}' cannot be deleted. Only draft quotes can be deleted.` 
        });
      }
      
      console.log(`🗑️ Admin deleting draft quote: ${quote.quoteNumber}`);
      const deleted = await storage.deleteQuote(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("❌ Error deleting quote:", error);
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // API to get quote data with HTML
  app.get("/api/quotes/by-code/:quoteCode", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      const foundQuote = quotes.find(q => q.quoteNumber === req.params.quoteCode);
      
      if (!foundQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      const quote = await storage.getQuote(foundQuote.id);
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Check if quote is still valid (30 days)
      const quoteDate = new Date(quote.createdAt!);
      const validUntil = new Date(quoteDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const isExpired = new Date() > validUntil;
      
      if (isExpired) {
        return res.status(410).json({ 
          error: "Quote expired", 
          message: "Esta cotización ha expirado. Las cotizaciones tienen una vigencia de 30 días.",
          expiredAt: validUntil.toISOString()
        });
      }
      
      // Generate HTML content
      const htmlContent = generateQuoteHTML(quote);
      
      res.json({
        quote,
        html: htmlContent,
        validUntil: validUntil.toISOString(),
        isExpired
      });
    } catch (error) {
      console.error("Error retrieving quote by code:", error);
      res.status(500).json({ error: "Failed to retrieve quote" });
    }
  });

  // Direct HTML route for sharing quotes
  app.get("/quote/:quoteCode", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      const foundQuote = quotes.find(q => q.quoteNumber === req.params.quoteCode);
      
      if (!foundQuote) {
        return res.status(404).send(`
          <html>
            <head>
              <title>Cotización no encontrada - PRIVEE</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc;">
              <h1 style="color: #dc2626;">Cotización no encontrada</h1>
              <p>La cotización con el código ${req.params.quoteCode} no existe o ha sido eliminada.</p>
              <p><a href="/" style="color: #3b82f6;">Volver al inicio</a></p>
            </body>
          </html>
        `);
      }
      
      const quote = await storage.getQuote(foundQuote.id);
      
      if (!quote) {
        return res.status(404).send(`
          <html>
            <head>
              <title>Cotización no encontrada - PRIVEE</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc;">
              <h1 style="color: #dc2626;">Cotización no encontrada</h1>
              <p>La cotización no está disponible.</p>
              <p><a href="/" style="color: #3b82f6;">Volver al inicio</a></p>
            </body>
          </html>
        `);
      }

      // Check if quote is still valid (30 days)
      const quoteDate = new Date(quote.createdAt!);
      const validUntil = new Date(quoteDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const isExpired = new Date() > validUntil;
      
      if (isExpired) {
        return res.status(410).send(`
          <html>
            <head>
              <title>Cotización Expirada - PRIVEE</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc;">
              <h1 style="color: #dc2626;">Cotización Expirada</h1>
              <p>Esta cotización expiró el ${validUntil.toLocaleDateString('es-ES')}.</p>
              <p>Las cotizaciones tienen una vigencia de 30 días desde su creación.</p>
              <p><a href="/" style="color: #3b82f6;">Volver al inicio</a></p>
            </body>
          </html>
        `);
      }
      
      // Generate and serve HTML content directly
      const htmlContent = generateQuoteHTML(quote);
      
      // PRODUCTION FIX: Ensure proper content type and encoding for Replit
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // CRITICAL: Set encoding explicitly for Replit deployment
      res.status(200).end(htmlContent, 'utf8');
    } catch (error) {
      console.error("Error serving quote HTML:", error);
      res.status(500).send(`
        <html>
          <head>
            <title>Error - PRIVEE</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc;">
            <h1 style="color: #dc2626;">Error del servidor</h1>
            <p>Ocurrió un error al cargar la cotización.</p>
            <p><a href="/" style="color: #3b82f6;">Volver al inicio</a></p>
          </body>
        </html>
      `);
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`🔐 Admin login attempt: ${username}`);
      
      const adminUser = await storage.authenticateAdmin(username, password);
      
      if (!adminUser) {
        console.log(`❌ Invalid credentials for: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log(`✅ Admin login successful: ${username}`);
      res.json({ 
        id: adminUser.id, 
        username: adminUser.username 
      });
    } catch (error) {
      console.error(`🚨 Admin login error for ${req.body?.username}:`, error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Change admin password
  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { username, currentPassword, newPassword } = req.body;
      
      if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
      }
      
      const adminUser = await storage.getAdminUserByUsername(username);
      if (!adminUser || adminUser.password !== currentPassword) {
        return res.status(400).json({ message: "Contraseña actual incorrecta" });
      }
      
      const updated = await storage.updateAdminPassword(username, newPassword);
      
      if (updated) {
        res.json({ message: "Contraseña actualizada exitosamente" });
      } else {
        res.status(500).json({ message: "Error al actualizar la contraseña" });
      }
    } catch (error) {
      console.error("Error changing admin password:", error);
      res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
  });

  app.post("/api/admin/register", async (req, res) => {
    try {
      const validatedData = insertAdminUserSchema.parse(req.body);
      const existingUser = await storage.getAdminUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const adminUser = await storage.createAdminUser(validatedData);
      res.status(201).json({ 
        id: adminUser.id, 
        username: adminUser.username 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos CSV'));
      }
    }
  });

  // CSV upload endpoint - supports both multipart file upload and JSON content
  app.post("/api/admin/upload-csv", upload.single('csvFile'), async (req: any, res) => {
    try {
      let csvData: string;
      let filename: string;

      // Check if data comes as JSON (from frontend) or as multipart file
      if (req.body && req.body.csvContent) {
        // JSON format from frontend
        csvData = req.body.csvContent;
        filename = req.body.filename || 'upload.csv';
        console.log("📂 Procesando CSV desde JSON:", filename);
      } else if (req.file) {
        // Multipart format
        csvData = req.file.buffer.toString('utf-8');
        filename = req.file.originalname;
        console.log("📂 Procesando archivo CSV:", filename);
      } else {
        return res.status(400).json({ 
          success: false, 
          message: "No se encontró archivo CSV" 
        });
      }
      const records: any[] = [];
      
      // Detect delimiter (comma or semicolon)
      const delimiter = csvData.includes(';') && !csvData.includes(',') ? ';' : ',';
      console.log(`🔍 Usando delimitador: "${delimiter}"`);
      
      // Parse CSV data
      const parser = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        delimiter: delimiter,
        relax_quotes: true,
        relax_column_count: true
      });

      // Collect all records
      for await (const record of parser) {
        records.push(record);
      }

      console.log(`📊 Encontrados ${records.length} registros en el CSV`);
      
      let stats = {
        items: 0,
        partners: 0,
        adminUsers: 0
      };

      // Process each record as a product
      for (const record of records) {
        try {
          // Validate required fields
          if (!record.name || !record.category || !record.basePrice) {
            console.warn("⚠️ Registro omitido (faltan campos requeridos):", record);
            continue;
          }

          const itemData = {
            name: String(record.name).trim(),
            description: String(record.description || "").trim(),
            category: String(record.category).trim(),
            basePrice: String(record.basePrice).trim(),
            minMargin: parseInt(record.minMargin) || 15,
            maxMargin: parseInt(record.maxMargin) || 30,
            quality: String(record.quality || "Oro").trim(),
            ambientacion: String(record.ambientacion || "Club").trim(),
            status: "active" as const
          };

          // Validate the item data
          const validatedItem = insertItemSchema.parse(itemData);
          await storage.createItem(validatedItem);
          stats.items++;
          
        } catch (error) {
          console.error("❌ Error procesando registro:", record, error);
        }
      }

      console.log(`✅ Importación de CSV completada: ${stats.items} productos importados`);
      
      res.json({
        success: true,
        message: `CSV importado exitosamente con ${stats.items} productos`,
        stats
      });
      
    } catch (error) {
      console.error("❌ Error procesando CSV:", error);
      res.status(500).json({
        success: false,
        message: "Error al procesar el archivo CSV",
        errors: [error instanceof Error ? error.message : "Error desconocido"]
      });
    }
  });

  // DEVELOPMENT FIX: Bulk import with complete CSV data loading
  app.post("/api/admin/bulk-import", async (req, res) => {
    try {
      console.log("🚀 FORZANDO carga masiva completa - ignorando productos existentes");
      
      // FORCE CLEAR: Always delete existing products for fresh load
      console.log("🗑️ Eliminando productos existentes para carga fresca...");
      await db.delete(quoteItems);
      await db.delete(quotes); 
      await db.delete(items);
      console.log("✅ Base de datos limpiada completamente");
      
      // CSV Data from data_1754941995278.csv (26 products)
      const csvProducts = [
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "326",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Club"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "342",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Ceremonia"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "763",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Gala"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "316",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Club"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "322",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Ceremonia"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "402",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Gala"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas Chiavari, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "652",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Club"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas Chiavari, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "668",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Ceremonia"
        },
        {
          name: "Mesa redonda con mantelería fina",
          description: "Sillas Chiavari, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",
          category: "Mobiliario",
          basePrice: "1034",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Gala"
        },
        // Decoración products
        {
          name: "Centro de mesa en bajo",
          description: "Iluminación ambiental",
          category: "Decoración",
          basePrice: "98",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Club"
        },
        {
          name: "Centro de mesa en bajo",
          description: "Iluminación ambiental",
          category: "Decoración",
          basePrice: "109",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Ceremonia"
        },
        {
          name: "Centro de mesa en bajo",
          description: "Iluminación ambiental",
          category: "Decoración",
          basePrice: "196",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Gala"
        },
        {
          name: "Centro de mesa en alto",
          description: "Iluminación ambiental",
          category: "Decoración",
          basePrice: "152",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Club"
        },
        {
          name: "Centro de mesa en alto",
          description: "Iluminación ambiental",
          category: "Decoración",
          basePrice: "163",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Ceremonia"
        },
        {
          name: "Centro de mesa en alto",
          description: "Iluminación ambiental",
          category: "Decoración",
          basePrice: "272",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Gala"
        },
        {
          name: "Centro de mesa en alto",
          description: "Iluminación ambiental de color",
          category: "Decoración",
          basePrice: "315",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Club"
        },
        {
          name: "Centro de mesa en alto",
          description: "Iluminación ambiental de color",
          category: "Decoración",
          basePrice: "326",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Ceremonia"
        },
        {
          name: "Centro de mesa en alto",
          description: "Iluminación ambiental de color",
          category: "Decoración",
          basePrice: "457",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Gala"
        },
        // Audio y Video products
        {
          name: "Equipo de sonido básico",
          description: "Micrófono inalámbrico",
          category: "Audio y Video",
          basePrice: "2174",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Club"
        },
        {
          name: "Equipo de sonido básico",
          description: "Micrófono inalámbrico",
          category: "Audio y Video",
          basePrice: "2283",
          minMargin: 15,
          maxMargin: 25,
          quality: "Plata",
          ambientacion: "Ceremonia"
        },
        {
          name: "Equipo de sonido profesional",
          description: "DJ, Micrófono inalámbrico",
          category: "Audio y Video",
          basePrice: "4348",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Club"
        },
        {
          name: "Equipo de sonido profesional",
          description: "DJ, Micrófono inalámbrico",
          category: "Audio y Video",
          basePrice: "4457",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Ceremonia"
        },
        {
          name: "Equipo de sonido profesional",
          description: "DJ, Micrófono inalámbrico",
          category: "Audio y Video",
          basePrice: "6522",
          minMargin: 15,
          maxMargin: 30,
          quality: "Oro",
          ambientacion: "Gala"
        },
        {
          name: "Equipo de sonido premium",
          description: "DJ profesional, Micrófono inalámbrico, Luces",
          category: "Audio y Video",
          basePrice: "8696",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Club"
        },
        {
          name: "Equipo de sonido premium",
          description: "DJ profesional, Micrófono inalámbrico, Luces",
          category: "Audio y Video",
          basePrice: "8804",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Ceremonia"
        },
        {
          name: "Equipo de sonido premium",
          description: "DJ profesional, Micrófono inalámbrico, Luces",
          category: "Audio y Video",
          basePrice: "13043",
          minMargin: 15,
          maxMargin: 35,
          quality: "Platino",
          ambientacion: "Gala"
        }
      ];
      
      let stats = { items: 0, partners: 0, adminUsers: 1 };
      
      console.log(`📋 Cargando ${csvProducts.length} productos del CSV...`);
      
      // Insert all products
      for (const product of csvProducts) {
        await storage.createItem({
          name: product.name,
          description: product.description,
          category: product.category as any,
          basePrice: product.basePrice,
          minMargin: product.minMargin,
          maxMargin: product.maxMargin,
          quality: product.quality as any,
          ambientacion: product.ambientacion as any,
          status: "active"
        });
        stats.items++;
      }
      
      // Get existing data counts
      const existingPartners = await storage.getPartners();
      stats.partners = existingPartners.length;
      
      try {
        const existingAdmin = await storage.getAdminUserByUsername("admin");
        stats.adminUsers = existingAdmin ? 1 : 0;
      } catch {
        stats.adminUsers = 0;
      }

      console.log(`✅ Bulk import completado: ${stats.items} productos cargados desde CSV embebido`);
      
      res.json({
        success: true,
        message: `Importación completada: ${stats.items} productos cargados exitosamente`,
        stats
      });
      
    } catch (error) {
      console.error("❌ Error en carga masiva:", error);
      res.status(500).json({
        success: false,
        message: "Error durante la importación masiva",
        errors: [error instanceof Error ? error.message : "Error desconocido"]
      });
    }
  });

  // Reset database endpoint
  app.post("/api/admin/reset-database", async (req, res) => {
    try {
      console.log("🗑️ Limpiando productos y cotizaciones...");
      
      // Limpiar solo productos y cotizaciones, manteniendo usuarios
      await db.delete(quoteItems);
      await db.delete(quotes);
      await db.delete(items);
      
      console.log("✅ Productos y cotizaciones eliminados");
      
      res.json({
        success: true,
        message: "Productos y cotizaciones eliminados exitosamente"
      });
      
    } catch (error) {
      console.error("❌ Error limpiando base de datos:", error);
      res.status(500).json({
        success: false,
        message: "Error al limpiar la base de datos",
        errors: [error instanceof Error ? error.message : "Error desconocido"]
      });
    }
  });

  // Partners management routes
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.get("/api/partners/:id", async (req, res) => {
    try {
      const partner = await storage.getPartner(req.params.id);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partner" });
    }
  });

  app.post("/api/partners", async (req, res) => {
    try {
      console.log("🔍 Creating partner with data:", { ...req.body, password: "[HIDDEN]" });
      const validatedData = insertPartnerSchema.parse(req.body);
      
      // Check if email already exists
      const existingPartner = await storage.getPartnerByEmail(validatedData.email);
      if (existingPartner) {
        console.log("❌ Partner creation failed: email already exists", validatedData.email);
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getPartnerByUsername(validatedData.username);
      if (existingUsername) {
        console.log("❌ Partner creation failed: username already exists", validatedData.username);
        return res.status(400).json({ message: "Username already registered" });
      }
      
      console.log("✅ Creating partner in database...");
      const partner = await storage.createPartner(validatedData);
      console.log("✅ Partner created successfully:", { id: partner.id, username: partner.username });
      res.status(201).json(partner);
    } catch (error) {
      console.error("❌ Partner creation error:", error);
      if (error instanceof z.ZodError) {
        console.log("❌ Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      console.error("❌ Unexpected error creating partner:", error);
      res.status(500).json({ message: "Failed to create partner", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/partners/:id", async (req, res) => {
    try {
      const validatedData = insertPartnerSchema.partial().parse(req.body);
      
      // If email is being updated, check for conflicts
      if (validatedData.email) {
        const existingPartner = await storage.getPartnerByEmail(validatedData.email);
        if (existingPartner && existingPartner.id !== req.params.id) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }
      
      const partner = await storage.updatePartner(req.params.id, validatedData);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePartner(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete partner" });
    }
  });

  // Setup endpoints for data seeding from admin panel
  app.post("/api/setup/seed-data", async (req, res) => {
    try {
      execSync("node scripts/seed-data.js", { stdio: "inherit" });
      res.json({ message: "Datos cargados exitosamente" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Error cargando datos" });
    }
  });

  app.post("/api/setup/seed-quotes", async (req, res) => {
    try {
      execSync("node scripts/seed-quotes.js", { stdio: "inherit" });
      res.json({ message: "Cotizaciones cargadas exitosamente" });
    } catch (error) {
      console.error("Error seeding quotes:", error);
      res.status(500).json({ message: "Error cargando cotizaciones" });
    }
  });

  app.post("/api/setup/load-csv", async (req, res) => {
    try {
      execSync("cd scripts && node csv-loader.js ../attached_assets/data_1754786989520.csv", { stdio: "inherit" });
      execSync("cd scripts && node seed-data.js", { stdio: "inherit" });
      res.json({ 
        message: "Catálogo completo recargado exitosamente",
        details: "24 productos del CSV más reciente + 3 socios cargados en memoria"
      });
    } catch (error) {
      console.error("Error loading CSV:", error);
      res.status(500).json({ 
        message: "Error cargando datos del CSV",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Endpoint de diagnóstico para producción
  app.get("/api/health", async (req, res) => {
    try {
      console.log("🔍 Health check solicitado");
      const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
        isProduction: process.env.REPLIT_DEPLOYMENT === '1',
        databaseConnected: false,
        itemsCount: 0
      };

      // Test database connection
      try {
        const testItems = await db.select().from(items).limit(1);
        health.databaseConnected = true;
        const allItems = await db.select().from(items);
        health.itemsCount = allItems.length;
      } catch (dbError) {
        console.error("Database health check failed:", dbError);
        health.databaseConnected = false;
      }

      res.json(health);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Health check failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Cookie debug endpoints
  app.get("/debug-cookies", (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'debug-cookies.html'));
  });

  app.get("/api/debug/session", (req: any, res) => {
    const sessionInfo = {
      sessionID: req.sessionID,
      session: req.session,
      cookies: req.headers.cookie,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
      authenticated: {
        admin: !!req.session?.adminUser,
        partner: !!req.session?.partnerUser
      }
    };
    
    res.json(sessionInfo);
  });

  console.log("🔧 Creando servidor HTTP...");
  const httpServer = createServer(app);
  console.log("✅ Servidor HTTP creado exitosamente");
  return httpServer;
}
