#!/usr/bin/env node

// Enhanced production error monitoring system
import fs from 'fs';

console.log('🔧 Creating enhanced production error handler...');

// Enhanced error handler code
const enhancedServerCode = `
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Production error tracking
const errorLog = [];
const MAX_ERROR_LOG_SIZE = 100;

function logError(error, req, additionalInfo = {}) {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    path: req?.path,
    method: req?.method,
    headers: req?.headers,
    body: req?.body,
    query: req?.query,
    params: req?.params,
    ...additionalInfo
  };
  
  errorLog.push(errorEntry);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }
  
  console.error('🚨 ERROR LOGGED:', JSON.stringify(errorEntry, null, 2));
}

// Enhanced error endpoint
app.get('/api/error-log', (req, res) => {
  res.json({
    errors: errorLog,
    count: errorLog.length,
    lastError: errorLog[errorLog.length - 1] || null
  });
});

// Configure UTF-8 encoding for all responses
app.use((req, res, next) => {
  try {
    // Only set JSON content-type for API routes
    if (req.path.startsWith('/api')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    next();
  } catch (error) {
    logError(error, req, { middleware: 'UTF-8 encoding' });
    next(error);
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  try {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = \`\${req.method} \${path} \${res.statusCode} in \${duration}ms\`;
        if (capturedJsonResponse) {
          logLine += \` :: \${JSON.stringify(capturedJsonResponse)}\`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
        
        // Log 500 errors specially
        if (res.statusCode >= 500) {
          logError(new Error(\`HTTP \${res.statusCode}\`), req, { 
            response: capturedJsonResponse,
            duration 
          });
        }
      }
    });

    next();
  } catch (error) {
    logError(error, req, { middleware: 'request logging' });
    next(error);
  }
});

// Global error handlers
process.on('uncaughtException', (error) => {
  logError(error, null, { type: 'uncaughtException' });
  console.error('🚨 UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logError(error, null, { type: 'unhandledRejection', promise: promise.toString() });
  console.error('🚨 UNHANDLED REJECTION:', reason);
});

(async () => {
  try {
    const server = await registerRoutes(app);
    
    // Initialize database with environment checking
    try {
      const { checkProductionEnvironment } = await import("./env-check");
      const envStatus = checkProductionEnvironment();
      
      if (!envStatus.hasRequiredEnvs) {
        log(\`❌ Faltan variables de entorno críticas: \${envStatus.missingEnvs.join(', ')}\`);
        if (envStatus.isProduction) {
          throw new Error(\`Variables de entorno faltantes en producción: \${envStatus.missingEnvs.join(', ')}\`);
        }
      }
      
      // Wait a moment for database connection to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (envStatus.isProduction) {
        log("🚀 Modo producción detectado - Inicializando base de datos...");
        const { initializeProductionDatabase } = await import("./production-init");
        await initializeProductionDatabase();
        log("✅ Base de datos de producción lista");
      } else {
        // Development mode - check if data exists
        const { db } = await import("./db");
        const { items } = await import("../shared/schema");
        
        const existingItems = await db.select().from(items).limit(1);
        
        if (existingItems.length === 0) {
          log("🔄 Base de datos vacía - esperando importación manual desde panel admin");
        } else {
          const totalItems = await db.select().from(items);
          log(\`✅ Base de datos configurada con \${totalItems.length} productos\`);
        }
      }
    } catch (error) {
      logError(error, null, { phase: 'database initialization' });
      log(\`❌ Error crítico en inicialización: \${error}\`);
      console.error("Stack trace completo:", error);
      
      // En producción, log el error pero intenta continuar con la aplicación básica
      if (process.env.REPLIT_DEPLOYMENT === '1') {
        log("⚠️ Error en inicialización de producción - continuando con aplicación básica");
        const errorDetails = error instanceof Error ? {
          name: error.constructor.name,
          message: error.message,
          stack: error.stack?.split('\\n').slice(0, 5).join('\\n')
        } : { message: String(error) };
        log(\`💾 Error details: \${JSON.stringify(errorDetails, null, 2)}\`);
        // No hacer process.exit(1) inmediatamente, permitir que la app arranque
      }
    }

    app.use((err, req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      // Log all errors
      logError(err, req, { status, middleware: 'error handler' });
      
      // Detailed logging for deployment debugging
      log(\`💥 ERROR \${status} en \${req.method} \${req.path}\`);
      log(\`📝 Message: \${message}\`);
      log(\`🔍 Error type: \${err.constructor.name}\`);
      log(\`📍 Stack: \${err.stack}\`);
      
      // Log request details for 500 errors
      if (status === 500) {
        log(\`📊 Request headers: \${JSON.stringify(req.headers, null, 2)}\`);
        log(\`🌍 Environment: NODE_ENV=\${process.env.NODE_ENV}, REPLIT_DEPLOYMENT=\${process.env.REPLIT_DEPLOYMENT}\`);
        log(\`📁 Working directory: \${process.cwd()}\`);
      }

      // Only send response if it hasn't been sent already
      if (!res.headersSent) {
        // In production, provide detailed error info for debugging
        const errorResponse = process.env.REPLIT_DEPLOYMENT === '1' 
          ? { 
              message, 
              status, 
              error: err.constructor.name,
              path: req.path,
              method: req.method,
              timestamp: new Date().toISOString(),
              errorId: errorLog.length - 1
            }
          : { message };
          
        res.status(status).json(errorResponse);
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    const isProduction = process.env.REPLIT_DEPLOYMENT === '1' || process.env.NODE_ENV === 'production';
    
    log(\`🔍 Verificación de modo de ejecución:\`);
    log(\`- REPLIT_DEPLOYMENT: \${process.env.REPLIT_DEPLOYMENT}\`);
    log(\`- NODE_ENV: \${process.env.NODE_ENV}\`);
    log(\`- isProduction resultado: \${isProduction}\`);
    
    if (!isProduction) {
      log("🔧 Modo desarrollo - usando Vite middleware");
      await setupVite(app, server);
    } else {
      log("🚀 Modo producción - sirviendo archivos estáticos");
      
      // Middleware personalizado para servir archivos estáticos con logging
      const path = await import("path");
      const fs = await import("fs");
      const express = await import("express");
      
      // En deployment, el working directory puede ser diferente
      // Intentar múltiples rutas posibles
      const possiblePaths = [
        path.resolve(import.meta.dirname, "..", "dist", "public"),
        path.resolve(process.cwd(), "dist", "public"),
        path.resolve("/home/runner/workspace", "dist", "public"),
        path.resolve(".", "dist", "public")
      ];
      
      let distPath = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          distPath = testPath;
          break;
        }
      }
      
      if (!distPath) {
        const error = new Error(\`No se encontró directorio de archivos estáticos. Rutas probadas: \${possiblePaths.join(', ')}\`);
        logError(error, null, { phase: 'static files setup', possiblePaths });
        throw error;
      }
      
      log(\`📁 Archivos estáticos encontrados en: \${distPath}\`);
      app.use(express.static(distPath));
      
      // SPA fallback with enhanced error handling
      app.use("*", (req, res) => {
        try {
          if (req.path.startsWith("/api/")) {
            return res.status(404).json({ message: "API endpoint not found" });
          }
          
          const indexPath = path.resolve(distPath, "index.html");
          log(\`📄 Sirviendo index.html desde: \${indexPath} para \${req.path}\`);
          
          if (!fs.existsSync(indexPath)) {
            const error = new Error(\`index.html no encontrado en: \${indexPath}\`);
            logError(error, req, { indexPath, distPath });
            log(\`❌ index.html no encontrado en: \${indexPath}\`);
            return res.status(500).json({ 
              message: "Static files not found",
              errorId: errorLog.length - 1
            });
          }
          
          res.sendFile(indexPath);
        } catch (error) {
          logError(error, req, { phase: 'SPA fallback' });
          res.status(500).json({ 
            message: "Error serving static files",
            errorId: errorLog.length - 1
          });
        }
      });
    }
    
    const port = parseInt(process.env.PORT || "5000", 10);
    log(\`🌍 Configuración de deployment:\`);
    log(\`- Puerto: \${port}\`);
    log(\`- Host: 0.0.0.0\`);
    log(\`- Modo producción: \${isProduction}\`);
    log(\`- NODE_ENV: \${process.env.NODE_ENV}\`);
    log(\`- REPLIT_DEPLOYMENT: \${process.env.REPLIT_DEPLOYMENT}\`);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(\`🚀 Servidor ejecutándose en puerto \${port}\`);
      log(\`📱 URL de acceso: http://0.0.0.0:\${port}\`);
      log(\`🔍 Error monitoring active - check /api/error-log for diagnostics\`);
    });
  } catch (error) {
    logError(error, null, { phase: 'server startup' });
    console.error('🚨 CRITICAL STARTUP ERROR:', error);
    process.exit(1);
  }
})();
`;

// Write the enhanced server code to server/index.ts
fs.writeFileSync('./server/index.ts', enhancedServerCode);

console.log('✅ Enhanced production error handler installed');
console.log('');
console.log('🔧 Features added:');
console.log('- Comprehensive error logging');
console.log('- Global error capture (uncaught exceptions, unhandled rejections)');
console.log('- Request-level error tracking');
console.log('- /api/error-log endpoint for diagnostics');
console.log('- Enhanced static file error handling');
console.log('- Production-specific error details');
console.log('');
console.log('🚀 Now rebuild and test:');
console.log('1. npm run build');
console.log('2. npm start');
console.log('3. Check /api/error-log for any 500 errors');