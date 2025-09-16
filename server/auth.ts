import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

console.log('🔐 Setting up platform-agnostic authentication system');

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
    name: 'privee_session',
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  console.log('✅ Platform-agnostic authentication configured');
  
  // Basic login endpoint for admin users
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Authenticate admin user using existing storage method
      const adminUser = await storage.authenticateAdmin(username, password);
      if (!adminUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      (req.session as any).adminId = adminUser.id;
      (req.session as any).userType = 'admin';
      
      res.json({ 
        message: "Login successful",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          type: 'admin'
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Partner login endpoint (already exists in routes.ts but adding here for completeness)
  app.post("/api/partner/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Authenticate partner using existing storage method
      const partner = await storage.authenticatePartner(username, password);
      if (!partner || !partner.isActive) {
        return res.status(401).json({ message: "Invalid credentials or account inactive" });
      }
      
      // Set session
      (req.session as any).partnerId = partner.id;
      (req.session as any).userType = 'partner';
      
      res.json({ 
        message: "Login successful",
        user: {
          id: partner.id,
          username: partner.username,
          fullName: partner.fullName,
          company: partner.company,
          type: 'partner'
        }
      });
    } catch (error) {
      console.error("Partner login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('privee_session');
      res.json({ message: "Logout successful" });
    });
  });
  
  // Get current authenticated user
  app.get("/api/auth/user", (req, res) => {
    const session = req.session as any;
    
    if (!session.adminId && !session.partnerId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (session.adminId) {
      res.json({
        id: session.adminId,
        type: 'admin',
        authenticated: true
      });
    } else if (session.partnerId) {
      res.json({
        id: session.partnerId,
        type: 'partner',
        authenticated: true
      });
    }
  });
  
  // Legacy endpoints for backwards compatibility (stub implementations)
  app.get("/api/login", (req, res) => {
    res.status(404).json({ 
      message: "Endpoint deprecated. Use /api/admin/login or /api/partner/login instead",
      endpoints: {
        admin: "/api/admin/login",
        partner: "/api/partner/login"
      }
    });
  });
  
  app.get("/api/callback", (req, res) => {
    res.status(404).json({ 
      message: "OAuth callback endpoint no longer available. Use direct login endpoints."
    });
  });
}

// Middleware to check if user is authenticated (any type)
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  
  if (!session.adminId && !session.partnerId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Add user info to request for compatibility
  if (session.adminId) {
    try {
      const adminUser = await storage.getAdminUser(session.adminId);
      if (!adminUser) {
        return res.status(401).json({ message: "Invalid session" });
      }
      
      (req as any).user = {
        id: adminUser.id,
        username: adminUser.username,
        type: 'admin',
        // Mock claims structure for backwards compatibility
        claims: {
          sub: adminUser.id,
          email: `${adminUser.username}@admin.local`,
          preferred_username: adminUser.username
        }
      };
    } catch (error) {
      console.error("Error fetching admin user:", error);
      return res.status(401).json({ message: "Invalid session" });
    }
  } else if (session.partnerId) {
    try {
      const partner = await storage.getPartner(session.partnerId);
      if (!partner || !partner.isActive) {
        return res.status(401).json({ message: "Invalid session or account inactive" });
      }
      
      (req as any).user = {
        id: partner.id,
        username: partner.username,
        type: 'partner',
        // Mock claims structure for backwards compatibility
        claims: {
          sub: partner.id,
          email: partner.email,
          preferred_username: partner.username
        }
      };
    } catch (error) {
      console.error("Error fetching partner:", error);
      return res.status(401).json({ message: "Invalid session" });
    }
  }
  
  next();
};

// Middleware to check if user is specifically an admin
export const isAdminAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  
  if (!session.adminId) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  
  try {
    const adminUser = await storage.getAdminUser(session.adminId);
    if (!adminUser) {
      return res.status(401).json({ message: "Invalid admin session" });
    }
    
    (req as any).user = {
      id: adminUser.id,
      username: adminUser.username,
      type: 'admin'
    };
    
    next();
  } catch (error) {
    console.error("Error fetching admin user:", error);
    res.status(401).json({ message: "Invalid admin session" });
  }
};

// Middleware to check if user is specifically a partner
export const isPartnerAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  
  if (!session.partnerId) {
    return res.status(401).json({ message: "Partner authentication required" });
  }
  
  try {
    const partner = await storage.getPartner(session.partnerId);
    if (!partner || !partner.isActive) {
      return res.status(401).json({ message: "Invalid partner session or account inactive" });
    }
    
    (req as any).user = {
      id: partner.id,
      username: partner.username,
      type: 'partner'
    };
    
    next();
  } catch (error) {
    console.error("Error fetching partner:", error);
    res.status(401).json({ message: "Invalid partner session" });
  }
};