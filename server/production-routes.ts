import type { Express } from "express";
import { storage } from "./storage";
import { insertItemSchema, insertQuoteSchema, insertQuoteItemSchema, insertAdminUserSchema, insertPartnerSchema, partnerLoginSchema, partnerPasswordChangeSchema, type QuoteWithItems, quoteItems, quotes, items, partners, adminUsers } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { parse } from "csv-parse";

// REPLIT DEPLOYMENT FIX: Simplified CSV upload without multer for production
// This solves the error 400 in deployed version

export function registerProductionRoutes(app: Express) {
  console.log("🔧 Registrando rutas de producción optimizadas para Replit...");

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      console.log("🔍 Health check solicitado");
      const itemsCount = await storage.getItems().then(items => items.length);
      
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        isProduction: process.env.REPLIT_DEPLOYMENT === "1",
        databaseConnected: true,
        itemsCount
      });
    } catch (error) {
      console.error("❌ Health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === "admin" && password === "Admin2025!") {
        console.log("🔐 Admin login attempt:", username);
        const adminUser = {
          id: "dd6a4a5a-494d-43eb-9314-448277a715ac",
          username: "admin"
        };
        console.log("✅ Admin login successful:", username);
        res.json(adminUser);
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("❌ Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // REPLIT DEPLOYMENT FIX: CSV upload without multer (text-based)
  app.post("/api/admin/upload-csv", async (req, res) => {
    try {
      console.log("📂 Procesando CSV en modo producción...");
      
      // Extract CSV data from request body (sent as text)
      const csvData = req.body.csvContent || req.body.data || '';
      
      if (!csvData || csvData.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No se encontró contenido CSV válido" 
        });
      }

      console.log(`📊 Procesando ${csvData.length} caracteres de CSV`);
      
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

  // Bulk import endpoint (unchanged, works fine)
  app.post("/api/admin/bulk-import", async (req, res) => {
    try {
      console.log("🚀 Iniciando carga masiva de datos...");
      
      // Verificar si ya existen datos
      const existingItems = await storage.getItems();
      const existingPartners = await storage.getPartners();
      
      let stats = {
        items: 0,
        partners: 0, 
        adminUsers: 0
      };

      // Importar productos de ejemplo si no existen
      if (existingItems.length === 0) {
        console.log("📦 Cargando productos de ejemplo...");
        
        const sampleProducts = [
          {
            name: "Desayuno Continental",
            description: "Café, jugos naturales, frutas de temporada, pan dulce y salado",
            category: "Menú",
            basePrice: "150",
            minMargin: 15,
            maxMargin: 25,
            quality: "Plata",
            ambientacion: "Club"
          },
          {
            name: "Cena Gala",
            description: "Menú de tres tiempos con proteína premium",
            category: "Menú",
            basePrice: "450", 
            minMargin: 20,
            maxMargin: 35,
            quality: "Platino",
            ambientacion: "Gala"
          },
          {
            name: "DJ Profesional",
            description: "Servicio de DJ con equipo de audio profesional 4 horas",
            category: "Audio y Video",
            basePrice: "3500",
            minMargin: 15,
            maxMargin: 30,
            quality: "Oro",
            ambientacion: "Club"
          }
        ];
        
        for (const product of sampleProducts) {
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
        console.log(`✅ ${stats.items} productos de ejemplo importados`);
      } else {
        stats.items = existingItems.length;
        console.log(`ℹ️ Ya existen ${stats.items} productos en la base de datos`);
      }

      // La gestión de usuarios y socios es únicamente manual a través del panel de administración
      stats.partners = existingPartners.length;
      
      // Contar admin users existentes
      try {
        const existingAdmin = await storage.getAdminUserByUsername("admin");
        stats.adminUsers = existingAdmin ? 1 : 0;
      } catch {
        stats.adminUsers = 0;
      }

      console.log("🎉 Carga masiva de productos completada exitosamente!");
      
      res.json({
        success: true,
        message: `Importación completada: ${stats.items} productos importados. Usuarios y socios se gestionan manualmente.`,
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

  // Add other essential routes...
  app.get("/api/admin/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  console.log("✅ Rutas de producción registradas exitosamente");
}