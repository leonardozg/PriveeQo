import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { items } from "../shared/schema";
import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

// Global error handlers for production
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  // Don't exit in production - continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production - continue running
});

(async () => {
  const app = express();

  try {

    // Basic security headers
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      if (req.path.startsWith('/api')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      next();
    });

    // Basic setup
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));

    // Simple request logging for production
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.path.startsWith("/api") && (res.statusCode >= 400 || duration > 1000)) {
          console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
        }
      });
      next();
    });

    // Register API routes (await the server setup)
    const server = await registerRoutes(app);
    
    console.log("✅ Routes registered, server created");
    console.log(`🔍 Database available: ${!!db}`);
    console.log(`🔍 Items schema available: ${!!items}`);

    // Static files serving for Digital Ocean
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const possiblePaths = [
      path.resolve(__dirname, "public"), // Built location: dist/public
      path.join(process.cwd(), "dist", "public"),
      path.resolve("dist/public"), 
      path.resolve("public") // Fallback
    ];
    
    let publicPath = "";
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        publicPath = testPath;
        break;
      }
    }
    
    if (publicPath && fs.existsSync(publicPath)) {
      console.log(`📁 Serving static files from: ${publicPath}`);
      
      // Serve static files (excluding API routes)
      app.use((req, res, next) => {
        if (req.path.startsWith('/api/')) {
          return next();
        }
        return express.static(publicPath, {
          maxAge: '1d',
          etag: true,
          lastModified: true
        })(req, res, next);
      });
      
      // SPA fallback for non-API routes
      app.use("*", (req, res) => {
        if (req.path.startsWith("/api/")) {
          return res.status(404).json({ message: "API endpoint not found" });
        }
        
        const indexPath = path.join(publicPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(500).json({ 
            message: "Index file not found",
            path: indexPath
          });
        }
      });
    } else {
      console.error(`❌ Static files directory not found. Checked: ${possiblePaths.join(', ')}`);
      app.use("*", (req, res) => {
        if (req.path.startsWith("/api/")) {
          return res.status(404).json({ message: "API endpoint not found" });
        }
        res.status(503).json({ 
          error: "Static files not available",
          message: "Frontend build missing - run build command",
          checkedPaths: possiblePaths,
          cwd: process.cwd()
        });
      });
    }

    // Error handler
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err);
      res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
        path: req.path
      });
    });

    // Digital Ocean requires port 8080
    const port = parseInt(process.env.PORT || '8080', 10);
    const host = '0.0.0.0';
    
    server.listen(port, host, () => {
      console.log(`🚀 PRIVEE production server running on http://${host}:${port}`);
      console.log(`📊 Health check: http://${host}:${port}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    });
    
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        process.exit(1);
      } else {
        console.error('🚨 Server error:', error);
        throw error;
      }
    });

  } catch (error) {
    console.error("Critical startup error:", error);
    process.exit(1);
  }
})();