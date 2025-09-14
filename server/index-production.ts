import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";
import session from "express-session";
import MemoryStore from "memorystore";

(async () => {
  const app = express();

  try {
    // Basic setup
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session configuration with fallback
    try {
      const memoryStore = MemoryStore(session);
      
      app.use(session({
        store: new memoryStore({ checkPeriod: 86400000 }),
        secret: process.env.SESSION_SECRET || "default-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000
        }
      }));
    } catch (sessionError: any) {
      console.log("Session setup error:", sessionError?.message || "Unknown session error");
    }

    // Register API routes
    registerRoutes(app);

    // Health endpoint
    app.get("/api/health", async (req, res) => {
      try {
        const health = {
          status: "ok",
          timestamp: new Date().toISOString(),
          environment: "production",
          isProduction: true,
          databaseConnected: false,
          itemsCount: 0
        };

        // Test database connection
        try {
          const { db } = await import("./db.js");
          const { items } = await import("../shared/schema.js");
          
          const testItems = await db.select().from(items).limit(1);
          health.databaseConnected = true;
          const allItems = await db.select().from(items);
          health.itemsCount = allItems.length;
        } catch (dbError) {
          console.error("Database health check failed:", dbError);
          health.databaseConnected = false;
        }

        res.json(health);
      } catch (error: any) {
        console.error("Health check error:", error);
        res.status(500).json({ 
          status: "error", 
          message: "Health check failed",
          error: error?.message || "Unknown error"
        });
      }
    });

    // Static files - check multiple possible locations
    const possiblePaths = [
      path.join(process.cwd(), "dist", "public"),
      path.resolve("dist/public"), 
      path.resolve("/home/runner/workspace/dist/public")
    ];
    
    let publicPath = "";
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        publicPath = testPath;
        break;
      }
    }
    
    if (publicPath && fs.existsSync(publicPath)) {
      console.log("Serving static files from:", publicPath);
      app.use(express.static(publicPath));
      
      // Fallback for SPA routes
      app.get("*", (req, res) => {
        if (req.path.startsWith("/api/")) {
          return res.status(404).json({ message: "API endpoint not found" });
        }
        
        const indexPath = path.join(publicPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(500).json({ message: "Static files not found" });
        }
      });
    } else {
      console.error("Static files directory not found:", publicPath);
      app.get("*", (req, res) => {
        res.status(500).json({ 
          message: "Static files not available",
          path: publicPath,
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

    const port = parseInt(process.env.PORT || '5000', 10);
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`Production server running on port ${port}`);
    });

  } catch (error) {
    console.error("Critical startup error:", error);
    process.exit(1);
  }
})();