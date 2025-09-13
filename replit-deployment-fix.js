#!/usr/bin/env node

// Comprehensive Replit deployment fix for error 500 issues
import fs from 'fs';

console.log('🔧 REPLIT DEPLOYMENT FIX - Addressing Common 500 Error Sources');

// Issue 1: Port binding in Replit must use HOST=0.0.0.0
// Issue 2: Environment detection in Replit
// Issue 3: Static file serving in Replit deployment context
// Issue 4: Database connection pooling limits
// Issue 5: Memory usage and session store

const fixedServerCode = `
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// REPLIT FIX 1: Enhanced error tracking for deployment
const errorLog = [];
const MAX_ERROR_LOG_SIZE = 50; // Reduced for memory efficiency

function logError(error, req, additionalInfo = {}) {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    message: error?.message || 'Unknown error',
    stack: error?.stack?.split('\\n').slice(0, 3).join('\\n'), // Truncated for memory
    path: req?.path,
    method: req?.method,
    userAgent: req?.headers?.['user-agent']?.substring(0, 100), // Truncated
    ...additionalInfo
  };
  
  errorLog.push(errorEntry);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }
  
  console.error('🚨 ERROR:', JSON.stringify(errorEntry, null, 2));
}

// Error log endpoint
app.get('/api/error-log', (req, res) => {
  res.json({
    errors: errorLog,
    count: errorLog.length,
    lastError: errorLog[errorLog.length - 1] || null,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      REPLIT_DEPLOYMENT: process.env.REPLIT_DEPLOYMENT,
      PORT: process.env.PORT,
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});

// REPLIT FIX 2: Middleware configuration for Replit environment
app.use((req, res, next) => {
  try {
    // Set proper headers for Replit
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Only set JSON content-type for API routes
    if (req.path.startsWith('/api')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    next();
  } catch (error) {
    logError(error, req, { middleware: 'headers' });
    next(error);
  }
});

// REPLIT FIX 3: Body parsing with error handling
app.use((req, res, next) => {
  try {
    express.json({ limit: '10mb' })(req, res, next);
  } catch (error) {
    logError(error, req, { middleware: 'json-parsing' });
    res.status(400).json({ message: 'Invalid JSON' });
  }
});

app.use((req, res, next) => {
  try {
    express.urlencoded({ extended: false, limit: '10mb' })(req, res, next);
  } catch (error) {
    logError(error, req, { middleware: 'urlencoded-parsing' });
    res.status(400).json({ message: 'Invalid form data' });
  }
});

// REPLIT FIX 4: Request logging with memory optimization
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
        
        // Only log response for errors or important endpoints
        if (res.statusCode >= 400 || path.includes('health') || path.includes('login')) {
          if (capturedJsonResponse) {
            const responseStr = JSON.stringify(capturedJsonResponse);
            logLine += \` :: \${responseStr.length > 80 ? responseStr.slice(0, 79) + "…" : responseStr}\`;
          }
        }

        log(logLine);
        
        // Log 500 errors with more detail
        if (res.statusCode >= 500) {
          logError(new Error(\`HTTP \${res.statusCode}\`), req, { 
            response: capturedJsonResponse,
            duration,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
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

// REPLIT FIX 5: Global error handlers optimized for deployment
process.on('uncaughtException', (error) => {
  logError(error, null, { type: 'uncaughtException' });
  console.error('🚨 UNCAUGHT EXCEPTION:', error.message);
  // Don't exit in production deployment
  if (process.env.REPLIT_DEPLOYMENT !== '1') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logError(error, null, { type: 'unhandledRejection' });
  console.error('🚨 UNHANDLED REJECTION:', error.message);
});

(async () => {
  try {
    const server = await registerRoutes(app);
    
    // REPLIT FIX 6: Database initialization with retry logic
    let dbInitialized = false;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { checkProductionEnvironment } = await import("./env-check");
        const envStatus = checkProductionEnvironment();
        
        if (!envStatus.hasRequiredEnvs) {
          log(\`❌ Faltan variables de entorno críticas: \${envStatus.missingEnvs.join(', ')}\`);
          if (envStatus.isProduction) {
            throw new Error(\`Variables de entorno faltantes en producción: \${envStatus.missingEnvs.join(', ')}\`);
          }
        }
        
        // Progressive wait times for database connection
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        
        if (envStatus.isProduction) {
          log(\`🚀 Modo producción detectado - Inicializando base de datos (intento \${attempt})...\`);
          const { initializeProductionDatabase } = await import("./production-init");
          await initializeProductionDatabase();
          log("✅ Base de datos de producción lista");
          dbInitialized = true;
          break;
        } else {
          // Development mode
          const { db } = await import("./db");
          const { items } = await import("../shared/schema");
          
          const existingItems = await db.select().from(items).limit(1);
          
          if (existingItems.length === 0) {
            log("🔄 Base de datos vacía - esperando importación manual desde panel admin");
          } else {
            const totalItems = await db.select().from(items);
            log(\`✅ Base de datos configurada con \${totalItems.length} productos\`);
          }
          dbInitialized = true;
          break;
        }
      } catch (error) {
        logError(error, null, { phase: 'database initialization', attempt });
        log(\`❌ Error en inicialización intento \${attempt}: \${error.message}\`);
        
        if (attempt === maxRetries) {
          if (process.env.REPLIT_DEPLOYMENT === '1') {
            log("⚠️ Error en inicialización de producción - continuando con aplicación básica");
            dbInitialized = false; // Continue without DB
            break;
          } else {
            throw error;
          }
        }
      }
    }

    // REPLIT FIX 7: Enhanced error middleware for production
    app.use((err, req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      logError(err, req, { status, middleware: 'error handler' });
      
      log(\`💥 ERROR \${status} en \${req.method} \${req.path}: \${message}\`);
      
      // Memory-conscious error logging
      if (status === 500) {
        log(\`🌍 Environment: NODE_ENV=\${process.env.NODE_ENV}, REPLIT_DEPLOYMENT=\${process.env.REPLIT_DEPLOYMENT}\`);
        log(\`📁 Working directory: \${process.cwd()}\`);
        log(\`💾 Memory: \${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\`);
      }

      if (!res.headersSent) {
        const errorResponse = process.env.REPLIT_DEPLOYMENT === '1' 
          ? { 
              message, 
              status, 
              error: err.constructor.name,
              path: req.path,
              method: req.method,
              timestamp: new Date().toISOString(),
              errorId: errorLog.length - 1,
              dbInitialized
            }
          : { message };
          
        res.status(status).json(errorResponse);
      }
    });

    // REPLIT FIX 8: Environment detection for Replit deployment
    const isProduction = process.env.REPLIT_DEPLOYMENT === '1' || process.env.NODE_ENV === 'production';
    
    log(\`🔍 Verificación de modo de ejecución:\`);
    log(\`- REPLIT_DEPLOYMENT: \${process.env.REPLIT_DEPLOYMENT}\`);
    log(\`- NODE_ENV: \${process.env.NODE_ENV}\`);
    log(\`- isProduction resultado: \${isProduction}\`);
    log(\`- DB initialized: \${dbInitialized}\`);
    
    if (!isProduction) {
      log("🔧 Modo desarrollo - usando Vite middleware");
      await setupVite(app, server);
    } else {
      log("🚀 Modo producción - sirviendo archivos estáticos");
      
      // REPLIT FIX 9: Static file serving with fallback paths
      try {
        const path = await import("path");
        const fs = await import("fs");
        const express = await import("express");
        
        // Multiple possible paths for Replit deployment
        const possiblePaths = [
          path.resolve(import.meta.dirname, "..", "dist", "public"),
          path.resolve(process.cwd(), "dist", "public"),
          path.resolve("/home/runner/workspace", "dist", "public"),
          path.resolve(".", "dist", "public"),
          path.resolve("./public"), // Fallback
          path.resolve("../public") // Another fallback
        ];
        
        let distPath = null;
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            distPath = testPath;
            log(\`📁 Found static files at: \${testPath}\`);
            break;
          }
        }
        
        if (!distPath) {
          const error = new Error(\`Static files not found. Checked: \${possiblePaths.join(', ')}\`);
          logError(error, null, { phase: 'static files setup', possiblePaths });
          
          // Fallback: serve from minimal index
          app.use("*", (req, res) => {
            if (req.path.startsWith("/api/")) {
              return res.status(404).json({ message: "API endpoint not found" });
            }
            res.status(200).send(\`
              <!DOCTYPE html>
              <html><head><title>PRIVEE</title></head>
              <body><h1>PRIVEE Sistema de Cotizaciones</h1>
              <p>Static files not found. Please redeploy.</p>
              <p><a href="/api/health">Health Check</a> | <a href="/api/error-log">Error Log</a></p>
              </body></html>
            \`);
          });
        } else {
          app.use(express.static(distPath, {
            maxAge: '1d',
            etag: true,
            lastModified: true
          }));
          
          // SPA fallback with enhanced error handling
          app.use("*", (req, res) => {
            try {
              if (req.path.startsWith("/api/")) {
                return res.status(404).json({ message: "API endpoint not found" });
              }
              
              const indexPath = path.resolve(distPath, "index.html");
              
              if (!fs.existsSync(indexPath)) {
                const error = new Error(\`index.html not found at: \${indexPath}\`);
                logError(error, req, { indexPath, distPath });
                return res.status(500).json({ 
                  message: "Application files not found",
                  errorId: errorLog.length - 1,
                  path: indexPath
                });
              }
              
              res.sendFile(indexPath);
            } catch (error) {
              logError(error, req, { phase: 'SPA fallback' });
              res.status(500).json({ 
                message: "Error serving application",
                errorId: errorLog.length - 1
              });
            }
          });
        }
      } catch (error) {
        logError(error, null, { phase: 'static setup' });
        throw error;
      }
    }
    
    // REPLIT FIX 10: Port and host binding for Replit
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0"; // Critical for Replit
    
    log(\`🌍 Configuración de deployment:\`);
    log(\`- Puerto: \${port}\`);
    log(\`- Host: \${host}\`);
    log(\`- Modo producción: \${isProduction}\`);
    log(\`- NODE_ENV: \${process.env.NODE_ENV}\`);
    log(\`- REPLIT_DEPLOYMENT: \${process.env.REPLIT_DEPLOYMENT}\`);
    log(\`- Process ID: \${process.pid}\`);
    
    server.listen({
      port,
      host,
      reusePort: false // May cause issues in Replit
    }, () => {
      log(\`🚀 Servidor ejecutándose en puerto \${port}\`);
      log(\`📱 URL de acceso: http://\${host}:\${port}\`);
      log(\`🔍 Error monitoring: /api/error-log\`);
      log(\`📊 Health check: /api/health\`);
      
      // Log memory usage at startup
      const memUsage = process.memoryUsage();
      log(\`💾 Memory: \${Math.round(memUsage.heapUsed/1024/1024)}MB used, \${Math.round(memUsage.heapTotal/1024/1024)}MB total\`);
    });
    
    // Health check for deployment verification
    server.on('error', (error) => {
      logError(error, null, { phase: 'server startup' });
      console.error('🚨 SERVER ERROR:', error);
    });
    
  } catch (error) {
    logError(error, null, { phase: 'main startup' });
    console.error('🚨 CRITICAL STARTUP ERROR:', error);
    
    // In Replit deployment, try to continue with minimal server
    if (process.env.REPLIT_DEPLOYMENT === '1') {
      console.log('⚠️ Starting minimal fallback server...');
      const fallbackApp = express();
      fallbackApp.get('/api/health', (req, res) => {
        res.json({ 
          status: 'degraded', 
          message: 'Running in fallback mode',
          error: error.message
        });
      });
      fallbackApp.get('*', (req, res) => {
        res.send('<h1>PRIVEE - Service Temporarily Unavailable</h1><p>Please try again in a few minutes.</p>');
      });
      fallbackApp.listen(parseInt(process.env.PORT || "5000"), "0.0.0.0");
    } else {
      process.exit(1);
    }
  }
})();
`;

fs.writeFileSync('./server/index.ts', fixedServerCode);

console.log('✅ Replit deployment fixes applied:');
console.log('');
console.log('🔧 Fixed Issues:');
console.log('- Host binding (0.0.0.0 for Replit)');
console.log('- Environment variable detection');
console.log('- Database connection retry logic');
console.log('- Memory-optimized error logging');
console.log('- Static file fallback paths');
console.log('- Enhanced error recovery');
console.log('- Production middleware configuration');
console.log('- Fallback server for critical errors');
console.log('');
console.log('🚀 Ready for deployment - rebuild and test:');
console.log('1. npm run build');
console.log('2. npm start');