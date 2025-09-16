# Production Configuration Guide for PRIVEE Application on Digital Ocean

## Overview
This guide covers the production-ready configuration for deploying the PRIVEE application with Digital Ocean PostgreSQL database, including security, performance, monitoring, and maintenance considerations.

## Table of Contents
1. [Environment Configuration](#1-environment-configuration)
2. [Security Configuration](#2-security-configuration)
3. [Performance Optimization](#3-performance-optimization)
4. [Monitoring and Logging](#4-monitoring-and-logging)
5. [Backup and Recovery](#5-backup-and-recovery)
6. [SSL and Encryption](#6-ssl-and-encryption)
7. [Connection Pooling](#7-connection-pooling)
8. [Maintenance and Updates](#8-maintenance-and-updates)

---

## 1. Environment Configuration

### Production Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://doadmin:your-password@your-host:25060/privee_db?sslmode=require"

# Application Configuration
NODE_ENV="production"
PORT="3000"
HOST="0.0.0.0"

# Session Configuration
SESSION_SECRET="your-super-secret-session-key-here-64-characters-long"
SESSION_NAME="privee_session"
SESSION_MAX_AGE="86400000"  # 24 hours in milliseconds

# Security Configuration
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW="900000"  # 15 minutes
RATE_LIMIT_MAX="100"        # 100 requests per window

# Application Settings
COMPANY_NAME="PRIVEE"
COMPANY_EMAIL="contacto@privee.com"
COMPANY_PHONE="+52 55 1234 5678"
DEFAULT_CURRENCY="MXN"
DEFAULT_TAX_RATE="16"       # 16% IVA in Mexico

# File Upload Configuration
MAX_FILE_SIZE="10485760"    # 10MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"

# Email Configuration (if using email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Logging Configuration
LOG_LEVEL="info"
LOG_FILE_PATH="/var/log/privee/app.log"
LOG_MAX_FILES="7"
LOG_MAX_SIZE="100m"
```

### Environment Variable Security

**DO NOT commit these values to version control!**

1. **Use a secret management service:**
   ```bash
   # Digital Ocean App Platform (if using)
   doctl apps create-deployment your-app-id --spec app-spec.yaml
   
   # Or use environment variables in your hosting platform
   ```

2. **Generate strong secrets:**
   ```bash
   # Generate a strong session secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate API keys
   openssl rand -hex 32
   ```

---

## 2. Security Configuration

### Database Security

1. **Connection Security:**
   ```javascript
   // In your database connection file
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: {
       rejectUnauthorized: false,  // For Digital Ocean managed databases
       ca: fs.readFileSync('/path/to/ca-certificate.crt')  // If using custom CA
     },
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 5000,
   });
   ```

2. **Network Security:**
   ```yaml
   # In Digital Ocean, configure trusted sources:
   trusted_sources:
     - type: app  # Your application
     - type: ip_addr
       value: "your.server.ip.address"
   ```

3. **Database User Permissions:**
   ```sql
   -- Create a limited application user (recommended)
   CREATE USER privee_app WITH PASSWORD 'strong-password-here';
   GRANT CONNECT ON DATABASE privee_db TO privee_app;
   GRANT USAGE ON SCHEMA public TO privee_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO privee_app;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO privee_app;
   
   -- Revoke dangerous permissions
   REVOKE CREATE ON SCHEMA public FROM privee_app;
   ```

### Application Security

1. **Input Validation and Sanitization:**
   ```javascript
   import { z } from 'zod';
   import DOMPurify from 'isomorphic-dompurify';
   
   // Validate all inputs
   const quoteSchema = z.object({
     clientName: z.string().min(1).max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/),
     clientEmail: z.string().email(),
     projectName: z.string().min(1).max(200),
   });
   
   // Sanitize HTML content
   const sanitizedDescription = DOMPurify.sanitize(userInput);
   ```

2. **Rate Limiting:**
   ```javascript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP, please try again later.',
     standardHeaders: true,
     legacyHeaders: false,
   });
   
   app.use('/api/', limiter);
   ```

3. **CORS Configuration:**
   ```javascript
   import cors from 'cors';
   
   const corsOptions = {
     origin: process.env.CORS_ORIGIN,
     credentials: true,
     optionsSuccessStatus: 200
   };
   
   app.use(cors(corsOptions));
   ```

---

## 3. Performance Optimization

### Database Performance

1. **Connection Pooling:**
   ```javascript
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,                    // Maximum number of clients
     min: 5,                     // Minimum number of clients
     idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
     connectionTimeoutMillis: 5000, // Return an error after 5 seconds
     acquireTimeoutMillis: 60000,   // Return an error after 60 seconds
   });
   ```

2. **Query Optimization:**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX CONCURRENTLY idx_quotes_partner_status ON quotes (partner_id, status);
   CREATE INDEX CONCURRENTLY idx_items_category_active ON items (category, status);
   CREATE INDEX CONCURRENTLY idx_quote_items_quote_lookup ON quote_items (quote_id, item_id);
   
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM quotes WHERE partner_id = 'uuid' AND status = 'draft';
   ```

3. **Database Maintenance:**
   ```sql
   -- Set up automatic vacuum and analyze
   ALTER TABLE items SET (autovacuum_analyze_scale_factor = 0.1);
   ALTER TABLE quotes SET (autovacuum_analyze_scale_factor = 0.1);
   
   -- Monitor table statistics
   SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del, last_vacuum, last_autovacuum 
   FROM pg_stat_user_tables;
   ```

### Application Performance

1. **Caching Strategy:**
   ```javascript
   import NodeCache from 'node-cache';
   
   // Cache product catalog for 1 hour
   const productCache = new NodeCache({ stdTTL: 3600 });
   
   async function getCachedProducts() {
     const cacheKey = 'active_products';
     let products = productCache.get(cacheKey);
     
     if (!products) {
       products = await storage.getItems();
       productCache.set(cacheKey, products);
     }
     
     return products;
   }
   ```

2. **Response Compression:**
   ```javascript
   import compression from 'compression';
   
   app.use(compression({
     level: 6,
     threshold: 1024,
     filter: (req, res) => {
       return compression.filter(req, res);
     }
   }));
   ```

---

## 4. Monitoring and Logging

### Application Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'privee-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 5
    })
  ]
});

// Log important events
logger.info('Quote created', { 
  quoteId: quote.id, 
  partnerId: quote.partnerId, 
  total: quote.total 
});

logger.error('Database connection failed', { 
  error: error.message, 
  stack: error.stack 
});
```

### Database Monitoring

```sql
-- Monitor active connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor database size
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Health Check Endpoints

```javascript
// Add health check routes
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

app.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      totalQuotes: await storage.getQuotes().then(q => q.length),
      totalProducts: await storage.getItems().then(i => i.length),
      totalPartners: await storage.getPartners().then(p => p.length),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 5. Backup and Recovery

### Digital Ocean Automated Backups

Digital Ocean provides automatic daily backups, but implement additional strategies:

1. **Configure Backup Retention:**
   ```bash
   # In Digital Ocean console, set backup retention to 7-30 days
   # Enable point-in-time recovery if available
   ```

2. **Manual Backup Script:**
   ```bash
   #!/bin/bash
   # backup-database.sh
   
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   BACKUP_FILE="privee_backup_$TIMESTAMP.sql"
   
   # Create backup
   pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
   
   # Compress backup
   gzip "$BACKUP_FILE"
   
   # Upload to cloud storage (optional)
   aws s3 cp "$BACKUP_FILE.gz" s3://your-backup-bucket/
   
   # Clean up old backups (keep last 30 days)
   find . -name "privee_backup_*.sql.gz" -mtime +30 -delete
   
   echo "Backup completed: $BACKUP_FILE.gz"
   ```

3. **Backup Verification:**
   ```bash
   #!/bin/bash
   # verify-backup.sh
   
   # Test restore to a temporary database
   createdb privee_test_restore
   gunzip -c latest_backup.sql.gz | psql privee_test_restore
   
   # Verify data integrity
   psql privee_test_restore -c "SELECT COUNT(*) FROM items;"
   psql privee_test_restore -c "SELECT COUNT(*) FROM quotes;"
   
   # Clean up
   dropdb privee_test_restore
   ```

### Recovery Procedures

1. **Point-in-Time Recovery:**
   ```bash
   # If using Digital Ocean's point-in-time recovery
   doctl databases backups list your-database-id
   doctl databases restore your-database-id --backup-id backup-id
   ```

2. **Application Recovery:**
   ```javascript
   // Implement graceful degradation
   class DatabaseService {
     async getItemsWithFallback() {
       try {
         return await this.getItems();
       } catch (error) {
         logger.error('Database error, using cache', error);
         return this.getCachedItems() || [];
       }
     }
   }
   ```

---

## 6. SSL and Encryption

### Database SSL Configuration

```javascript
// Force SSL connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // For Digital Ocean managed databases
  }
});

// For custom certificates
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync('/path/to/ca-certificate.crt'),
    cert: fs.readFileSync('/path/to/client-certificate.crt'),
    key: fs.readFileSync('/path/to/client-key.key'),
    rejectUnauthorized: true
  }
});
```

### Application HTTPS

```javascript
import https from 'https';
import fs from 'fs';

// For production with SSL certificates
if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync('/path/to/private-key.pem'),
    cert: fs.readFileSync('/path/to/certificate.pem')
  };
  
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
  
  // Redirect HTTP to HTTPS
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 7. Connection Pooling

### Advanced Pool Configuration

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // Connection pool settings
  max: 20,                      // Maximum number of clients
  min: 5,                       // Minimum number of clients
  
  // Timing settings
  idleTimeoutMillis: 30000,     // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds
  acquireTimeoutMillis: 60000,   // Return an error after 60 seconds
  
  // SSL settings
  ssl: { rejectUnauthorized: false },
  
  // Application name for monitoring
  application_name: 'privee-production'
});

// Monitor pool status
pool.on('connect', (client) => {
  logger.info('New client connected', { 
    processID: client.processID,
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  });
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
```

---

## 8. Maintenance and Updates

### Regular Maintenance Tasks

1. **Database Maintenance Schedule:**
   ```bash
   #!/bin/bash
   # maintenance.sh - Run weekly
   
   # Update table statistics
   psql "$DATABASE_URL" -c "ANALYZE;"
   
   # Vacuum full (monthly)
   if [ $(date +%d) -eq 01 ]; then
     psql "$DATABASE_URL" -c "VACUUM FULL;"
   fi
   
   # Reindex if needed
   psql "$DATABASE_URL" -c "REINDEX DATABASE privee_db;"
   ```

2. **Application Updates:**
   ```bash
   #!/bin/bash
   # deploy.sh - Safe deployment script
   
   # Run database migrations
   npm run db:migrate
   
   # Restart application with zero downtime
   pm2 reload privee-app
   
   # Verify deployment
   curl -f http://localhost:3000/health || exit 1
   
   echo "Deployment successful"
   ```

3. **Security Updates:**
   ```bash
   # Update dependencies monthly
   npm audit
   npm update
   
   # Check for security vulnerabilities
   npm audit fix
   ```

### Performance Monitoring

```sql
-- Create monitoring views
CREATE VIEW performance_metrics AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables;

-- Monitor slow queries
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    (100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0)) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 1000  -- Queries slower than 1 second
ORDER BY mean_time DESC;
```

---

## Production Checklist

### Pre-Deployment Checklist

- [ ] Environment variables configured and secured
- [ ] Database connection tested with production credentials
- [ ] SSL certificates installed and configured
- [ ] Backup strategy implemented and tested
- [ ] Monitoring and logging configured
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Error handling and graceful degradation implemented
- [ ] Health check endpoints created
- [ ] Performance optimizations applied
- [ ] Security measures implemented (input validation, sanitization)
- [ ] Connection pooling configured
- [ ] Database indexes created and optimized

### Post-Deployment Monitoring

- [ ] Monitor application performance metrics
- [ ] Check database connection pool status
- [ ] Verify backup creation and integrity
- [ ] Monitor error rates and response times
- [ ] Check SSL certificate expiration dates
- [ ] Review security logs for anomalies
- [ ] Monitor database performance and query times
- [ ] Verify all features work correctly in production

---

## Support and Troubleshooting

### Common Production Issues

1. **High CPU Usage:**
   - Check for slow queries in `pg_stat_statements`
   - Review connection pool settings
   - Analyze application bottlenecks

2. **Memory Issues:**
   - Monitor Node.js heap usage
   - Check for memory leaks in application code
   - Review database connection pool size

3. **Database Connection Issues:**
   - Verify SSL configuration
   - Check firewall and network settings
   - Review connection pool settings

4. **Performance Degradation:**
   - Analyze slow query logs
   - Check database vacuum and analyze statistics
   - Review index usage and effectiveness

For additional support:
- Digital Ocean Database Documentation
- PostgreSQL Performance Tuning Guide
- Node.js Production Best Practices

---

This production configuration guide ensures your PRIVEE application runs securely, efficiently, and reliably in a production environment with Digital Ocean PostgreSQL.