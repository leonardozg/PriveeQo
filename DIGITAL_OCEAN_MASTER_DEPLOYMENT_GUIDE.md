# PRIVEE Digital Ocean Master Deployment Guide

**Complete Production Deployment Process for Digital Ocean App Platform**

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Repository Preparation](#phase-1-repository-preparation)
4. [Phase 2: Database Setup](#phase-2-database-setup)
5. [Phase 3: Application Deployment](#phase-3-application-deployment)
6. [Phase 4: Verification & Testing](#phase-4-verification--testing)
7. [Phase 5: Post-Deployment Configuration](#phase-5-post-deployment-configuration)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Complete Deployment Checklist](#complete-deployment-checklist)

---

## Overview

This guide provides a complete, step-by-step process for deploying the PRIVEE event management application to Digital Ocean App Platform. The deployment includes:

- **Frontend**: React + Vite application with modern UI components
- **Backend**: Express.js API server with authentication and business logic  
- **Database**: PostgreSQL with 87 products, user management, and quote system
- **Authentication**: Replit Auth integration with admin and partner roles
- **File Storage**: PDF generation and document management

**Estimated Deployment Time**: 45-60 minutes  
**Technical Level**: Intermediate  
**Cost**: ~$24-48/month (depending on resource selection)

---

## Prerequisites

### Required Accounts & Services
- [ ] **Digital Ocean Account** with billing enabled
- [ ] **GitHub Account** with repository access
- [ ] **Local Development Environment** (Node.js 18+, Git)

### Required Tools
```bash
# Verify these are installed locally
node --version    # Should be 18.0.0+
npm --version     # Should be 8.0.0+
git --version     # Should be 2.0.0+
```

### Required Information
- [ ] **Database Credentials**: Strong passwords for admin and partner accounts
- [ ] **Session Secret**: 64-character cryptographic secret
- [ ] **GitHub Repository**: Public or granted access to Digital Ocean

### Pre-Deployment Security Setup

**Generate Session Secret:**
```bash
# Generate a secure session secret (save this!)
node -p "require('crypto').randomBytes(64).toString('hex')"
```

**Choose Secure Passwords:**
- **Admin Password**: Minimum 8 characters, include letters, numbers, symbols
- **Partner Password**: Minimum 6 characters, alphanumeric

---

## Phase 1: Repository Preparation

### Step 1.1: Repository Setup

**If you don't have the code yet:**
```bash
# Clone the repository
git clone https://github.com/your-username/privee-deployment
cd privee-deployment
```

**If you have local changes:**
```bash
# Commit and push all changes
git add .
git commit -m "Prepare for Digital Ocean deployment"
git push origin main
```

### Step 1.2: Verify Required Files

Ensure these critical files exist in your repository:

```bash
# Core deployment files
ls -la app-spec.yaml                    # ✅ Digital Ocean configuration
ls -la build-production.js             # ✅ Production build script
ls -la server/index-production.ts      # ✅ Production server
ls -la do-database-init.js            # ✅ Database initialization

# Application files
ls -la package.json                    # ✅ Dependencies
ls -la shared/schema.ts               # ✅ Database schema
ls -la client/src/                    # ✅ Frontend code
ls -la server/routes.ts              # ✅ API routes
```

### Step 1.3: Update app-spec.yaml

Edit `app-spec.yaml` and replace placeholder values:

```yaml
# Line 5: Update repository information
github:
  repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME  # 🔄 Replace with your repository
  branch: main                               # ✅ Usually 'main' or 'master'
  deploy_on_push: true

# Line 31: Update session secret (from prerequisites)
- key: SESSION_SECRET
  value: YOUR_64_CHARACTER_SECRET_HERE       # 🔄 Replace with generated secret
  scope: RUN_TIME
  type: SECRET
```

**Commit these changes:**
```bash
git add app-spec.yaml
git commit -m "Update Digital Ocean configuration"
git push origin main
```

---

## Phase 2: Database Setup

### Step 2.1: Create PostgreSQL Database

1. **Login to Digital Ocean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Navigate to **"Databases"** → **"Create Database Cluster"**

2. **Database Configuration**
   ```
   Database Engine: PostgreSQL
   Version: 15.x (latest stable)
   Datacenter Region: [Choose closest to your users]
   
   Configuration Options:
   • Development: Basic (1GB RAM, 1vCPU, 10GB SSD) - $15/month
   • Production: Professional (2GB RAM, 1vCPU, 25GB SSD) - $30/month
   
   Cluster Name: privee-production-db
   Database Name: privee_db
   ```

3. **Security Configuration**
   - **Trusted Sources**: Add your deployment IP and local IP for setup
   - **SSL Mode**: Enable (required for security)
   - **Firewall**: Restrict to application and admin IPs only

4. **Save Connection Details**
   After creation (5-10 minutes), save these details:
   ```
   Host: [cluster-name]-do-user-[numbers].b.db.ondigitalocean.com
   Port: 25060
   Database: privee_db
   Username: doadmin
   Password: [auto-generated - save this!]
   Connection String: postgresql://doadmin:[password]@[host]:25060/privee_db?sslmode=require
   ```

### Step 2.2: Initialize Database Schema and Data

**Set Environment Variables:**
```bash
# Required: Database connection (replace with your actual connection string)
export DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@YOUR_HOST:25060/privee_db?sslmode=require"

# Required: Secure credentials for your application
export ADMIN_PASSWORD="your_secure_admin_password"
export PARTNER_PASSWORD="your_secure_partner_password"

# Optional: Customize default values
export ADMIN_USERNAME="admin"
export PARTNER_USERNAME="Alonso1"
export PARTNER_FULL_NAME="Alonso Magos"
export PARTNER_COMPANY="Exp Log"
export PARTNER_EMAIL="alonso@explog.com"
```

**Run Database Initialization:**
```bash
# This script will create schema, admin user, 87 products, and sample partner
node do-database-init.js
```

**Expected Output:**
```
✅ Connected to Digital Ocean database
✅ All tables created successfully
✅ Admin user created (username: admin)
✅ 87 products loaded across all categories
✅ Sample partner created (username: Alonso1)
✅ Database initialization completed successfully

📊 Final Count:
- Items: 87
- Admin Users: 1
- Partners: 1
```

### Step 2.3: Verify Database Setup

**Test Database Connection:**
```bash
# Quick verification script
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  console.log('✅ Database connection successful');
  return client.query('SELECT COUNT(*) FROM items');
}).then(result => {
  console.log(\`✅ Products loaded: \${result.rows[0].count}\`);
  return client.end();
}).catch(err => {
  console.error('❌ Database error:', err.message);
});
"
```

---

## Phase 3: Application Deployment

### Step 3.1: Create Digital Ocean App

1. **Navigate to App Platform**
   - Digital Ocean Console → **"Apps"** → **"Create App"**

2. **Connect GitHub Repository**
   - **Source**: GitHub
   - **Repository**: Select your PRIVEE repository
   - **Branch**: main
   - **Autodeploy**: Enable (deploys on git push)

3. **Import Configuration**
   - **Method**: "Import from app spec"
   - **Upload**: Select `app-spec.yaml` from your repository
   - **Review**: Verify all settings loaded correctly

### Step 3.2: Configure Environment Variables

In the Digital Ocean dashboard, add these environment variables:

| Variable | Value | Type | Scope |
|----------|--------|------|-------|
| `NODE_ENV` | `production` | General | Build & Runtime |
| `PORT` | `8080` | General | Runtime |
| `SESSION_SECRET` | `[your 64-character secret]` | **Secret** | Runtime |
| `DATABASE_URL` | `${privee-db.DATABASE_URL}` | General | Build & Runtime |

**Important Notes:**
- Mark `SESSION_SECRET` as **SECRET** type for encryption
- `DATABASE_URL` references the internal database service
- Never paste raw database credentials in the dashboard

### Step 3.3: Resource Configuration

**Review and adjust these settings:**

```yaml
# App Configuration
Name: privee-quote-system
Region: [Your preferred region]

# Service Configuration
Service Name: privee-web
Instance Size: apps-s-1vcpu-1gb    # Basic: $12/month
Instance Count: 1                   # Can scale later

# Database Configuration (if using internal database)
Database Name: privee-db
Engine: PostgreSQL 15
Size: apps-db-s-dev               # Development: $15/month
```

### Step 3.4: Deploy Application

1. **Start Deployment**
   - Click **"Create Resources"** 
   - Digital Ocean will begin the build process

2. **Monitor Build Progress**
   - **Build Phase**: Watch for Vite frontend build and esbuild backend compilation
   - **Deploy Phase**: Monitor container startup and health checks
   - **Expected Duration**: 5-8 minutes for initial deployment

3. **Build Process Verification**
   ```
   ✅ Repository cloned successfully
   ✅ Running: node build-production.js
   ✅ Frontend built (Vite) → dist/public/
   ✅ Backend built (esbuild) → dist/index.js
   ✅ Production package.json created
   ✅ Container image created
   ✅ Deployment started
   ✅ Health check passed: /api/health
   ```

---

## Phase 4: Verification & Testing

### Step 4.1: Health Check Verification

**Your app will be available at**: `https://[app-name]-[hash].ondigitalocean.app`

**Test Health Endpoint:**
```bash
curl https://your-app-url.ondigitalocean.app/api/health

# Expected Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "database": "connected",
  "node_version": "22.x.x"
}
```

### Step 4.2: Application Functionality Tests

**Admin Panel Test:**
1. Navigate to: `https://your-app-url/admin`
2. Login with: `admin` / `[your_admin_password]`
3. Verify: Dashboard loads, products visible, partner management works

**Partner Login Test:**
1. Navigate to: `https://your-app-url/partner/login`
2. Login with: `Alonso1` / `[your_partner_password]`
3. Verify: Quote generation works, PDF export functions

**API Endpoint Tests:**
```bash
# Test products API
curl https://your-app-url/api/items | jq '.length'
# Should return: 87

# Test categories
curl https://your-app-url/api/items | jq 'map(.category) | unique'
# Should return: ["Audio y Video", "Branding", "Decoración", "Espectáculos", "Fotografía", "Memorabilia", "Menú", "Mobiliario"]
```

### Step 4.3: Performance & Security Verification

**Performance Tests:**
```bash
# Test page load speed
curl -w "@curl-format.txt" -o /dev/null -s https://your-app-url/

# Test static asset delivery
curl -I https://your-app-url/assets/index.css
```

**Security Headers Check:**
```bash
curl -I https://your-app-url/

# Expected Security Headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

## Phase 5: Post-Deployment Configuration

### Step 5.1: Custom Domain Setup (Optional)

1. **Add Domain in Digital Ocean**
   - Apps → Your App → Settings → Domains
   - Add your custom domain (e.g., `quotes.yourcompany.com`)

2. **Configure DNS Records**
   ```
   Type: CNAME
   Host: quotes
   Value: [your-app-name]-[hash].ondigitalocean.app
   TTL: 3600
   ```

3. **SSL Certificate**
   - Digital Ocean automatically provisions Let's Encrypt certificates
   - Certificate renewal is handled automatically

### Step 5.2: Security Hardening

**Environment Variable Audit:**
- [ ] All secrets marked as **SECRET** type
- [ ] No plaintext passwords in configuration
- [ ] Database connection uses SSL mode

**Database Security:**
- [ ] Firewall rules restrict access to app servers only
- [ ] Database backups enabled (automatic)
- [ ] Connection pooling configured (handled by app)

**Application Security:**
- [ ] Security headers enabled (automatically by production server)
- [ ] HTTPS enforced (automatic with Digital Ocean)
- [ ] Session security configured

### Step 5.3: Backup Configuration

**Database Backups:**
- Digital Ocean automatically creates daily backups
- Retention: 7 days (Basic), 30 days (Professional)
- Manual backups can be created anytime

**Application Backups:**
- Code is backed up in GitHub repository
- Container images are versioned in Digital Ocean registry
- Environment configuration is backed up in app-spec.yaml

### Step 5.4: Monitoring Setup

**Built-in Monitoring:**
- Resource usage: CPU, RAM, Network
- Application logs: Real-time and historical
- Performance metrics: Response times, error rates

**Health Monitoring:**
```bash
# Set up automated health checks
curl -X POST https://api.digitalocean.com/v2/monitoring/alerts \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "v1/insights/droplet/load_1",
    "description": "High load average",
    "compare": "GreaterThan",
    "value": 0.8,
    "window": "5m",
    "entities": ["your-app-id"]
  }'
```

---

## Troubleshooting Guide

### Common Build Errors

**Error: "Frontend build failed"**
```bash
# Symptom: Vite build fails during deployment
# Solution: Check package.json dependencies
npm install
npm run build  # Test locally first
```

**Error: "Backend build failed"**
```bash
# Symptom: esbuild compilation fails
# Solution: Verify TypeScript and import paths
npx tsc --noEmit  # Check for TypeScript errors
```

**Error: "Dependencies not found"**
```bash
# Symptom: Missing production dependencies
# Solution: Verify package.json includes all runtime dependencies
# Check build-production.js for the production dependency list
```

### Database Connection Issues

**Error: "Database connection failed"**
```bash
# 1. Verify connection string format
echo $DATABASE_URL
# Should be: postgresql://doadmin:password@host:25060/privee_db?sslmode=require

# 2. Test connection manually
node -e "const{Client}=require('pg');new Client({connectionString:process.env.DATABASE_URL}).connect().then(()=>console.log('✅ OK')).catch(console.error)"

# 3. Check firewall settings in Digital Ocean database dashboard
```

**Error: "SSL connection required"**
```bash
# Symptom: "no pg_hba.conf entry" or SSL errors
# Solution: Ensure connection string includes ?sslmode=require
export DATABASE_URL="${DATABASE_URL}?sslmode=require"
```

### Application Runtime Errors

**Error: "Health check failing"**
```bash
# 1. Check application logs in Digital Ocean dashboard
# 2. Verify PORT environment variable is set to 8080
# 3. Test health endpoint directly:
curl https://your-app-url/api/health
```

**Error: "Static files not found"**
```bash
# Symptom: 404 errors for frontend assets
# Solution: Verify frontend build completed successfully
# Check that dist/public/ contains index.html and assets/
```

**Error: "Authentication not working"**
```bash
# 1. Verify session secret is set and marked as SECRET
# 2. Check that admin/partner users exist in database:
node -e "
const{Client}=require('pg');
const client=new Client({connectionString:process.env.DATABASE_URL});
client.connect().then(()=>client.query('SELECT username FROM admin_users')).then(r=>console.log('Admin users:',r.rows)).finally(()=>client.end());
"
```

### Performance Issues

**Issue: "Slow response times"**
```bash
# 1. Check resource usage in Digital Ocean dashboard
# 2. Consider upgrading instance size:
#    apps-s-1vcpu-1gb → apps-s-1vcpu-2gb
# 3. Monitor database performance and consider upgrading database tier
```

**Issue: "Memory usage too high"**
```bash
# 1. Check for memory leaks in application logs
# 2. Restart application: Digital Ocean Apps → Your App → Actions → Restart
# 3. Consider upgrading to higher memory instance
```

### SSL/HTTPS Issues

**Issue: "SSL certificate not working"**
- Digital Ocean automatically provisions certificates
- Wait 5-10 minutes after adding custom domain
- Verify DNS records are correctly configured
- Contact Digital Ocean support if issues persist

---

## Monitoring & Maintenance

### Daily Monitoring Tasks

**Health Checks:**
```bash
# Automated daily health check script
#!/bin/bash
curl -s https://your-app-url/api/health | jq .status
if [ $? -eq 0 ]; then
  echo "✅ Application healthy"
else
  echo "❌ Application health check failed"
fi
```

**Log Monitoring:**
- Review application logs for errors
- Monitor resource usage trends
- Check database performance metrics

### Weekly Maintenance Tasks

**Updates & Security:**
- Review Digital Ocean security advisories
- Monitor dependency security vulnerabilities
- Update app-spec.yaml if needed
- Test backup and restore procedures

**Performance Review:**
- Analyze response time trends
- Review resource utilization
- Optimize database queries if needed
- Consider scaling up/down based on usage

### Monthly Maintenance Tasks

**Capacity Planning:**
- Review month-over-month usage trends
- Plan for capacity increases
- Review and optimize costs
- Update disaster recovery procedures

**Security Audit:**
- Review access logs
- Audit user accounts and permissions
- Update passwords and secrets if needed
- Review firewall and access rules

---

## Complete Deployment Checklist

### Pre-Deployment ✅

- [ ] Digital Ocean account created and billing enabled
- [ ] GitHub repository with PRIVEE code pushed
- [ ] Session secret generated (64 characters)
- [ ] Admin and partner passwords chosen (secure)
- [ ] app-spec.yaml updated with repository and secrets
- [ ] All required files verified in repository

### Database Setup ✅

- [ ] PostgreSQL database cluster created
- [ ] Database connection string saved securely
- [ ] Firewall rules configured for security
- [ ] Environment variables set locally
- [ ] Database initialization script completed successfully
- [ ] Admin user, partner user, and 87 products verified

### Application Deployment ✅

- [ ] Digital Ocean App created and connected to GitHub
- [ ] Environment variables configured (SESSION_SECRET as secret)
- [ ] Resource allocation appropriate for usage
- [ ] Build process completed without errors
- [ ] Container deployed and health checks passing
- [ ] Application URL accessible and responding

### Verification & Testing ✅

- [ ] Health endpoint returns "healthy" status
- [ ] Admin panel login works with created credentials
- [ ] Partner login works with created credentials
- [ ] Product catalog displays all 87 items correctly
- [ ] Quote generation and PDF export functional
- [ ] API endpoints responding correctly
- [ ] Performance meets requirements (< 2s response times)

### Post-Deployment Configuration ✅

- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned and working
- [ ] Monitoring and alerting set up
- [ ] Backup procedures verified
- [ ] Security headers and HTTPS enforced
- [ ] Documentation updated with production URLs and credentials

### Go-Live Checklist ✅

- [ ] All stakeholders notified of production URL
- [ ] User credentials distributed securely
- [ ] Support procedures documented
- [ ] Monitoring dashboards configured
- [ ] Disaster recovery plan tested
- [ ] Performance baselines established

---

## Success Metrics

Your deployment is successful when:

✅ **Technical Metrics:**
- Health check responds within 2 seconds
- All 87 products load correctly
- Authentication works for both admin and partner roles
- PDF generation completes without errors
- Database queries execute within 500ms

✅ **Functional Metrics:**
- Complete quote workflow (create → edit → export PDF)
- Admin can manage partners and products
- Partner can generate and manage quotes
- CSV import functionality works
- All pages load without 404 errors

✅ **Performance Metrics:**
- Page load times < 3 seconds
- Memory usage < 512MB (basic tier)
- CPU usage < 70% under normal load
- Database connections stable

---

## Support and Resources

### Digital Ocean Resources
- **Documentation**: [docs.digitalocean.com/products/app-platform](https://docs.digitalocean.com/products/app-platform)
- **Community**: [community.digitalocean.com](https://community.digitalocean.com)
- **Support**: Available 24/7 for paid accounts

### Application Support
- **GitHub Repository**: Your PRIVEE repository
- **Local Development**: `npm run dev` for local testing
- **Database Access**: Use `psql` or GUI tools with connection string

### Emergency Procedures

**Application Down:**
1. Check Digital Ocean status page
2. Review application logs in DO dashboard
3. Restart application if needed
4. Check database connectivity
5. Escalate to DO support if infrastructure issue

**Database Issues:**
1. Check database cluster status
2. Verify connection string and credentials
3. Check firewall rules
4. Review database logs
5. Contact DO database support

---

## Deployment Complete! 🎉

Your PRIVEE application is now live on Digital Ocean App Platform with:

- ✅ Production-grade PostgreSQL database
- ✅ Scalable Express.js backend
- ✅ Modern React frontend
- ✅ Complete authentication system
- ✅ 87 products across all categories
- ✅ PDF quote generation
- ✅ Admin and partner management

**Your Production URL**: `https://[app-name]-[hash].ondigitalocean.app`

**Next Steps:**
1. Share production URL with stakeholders
2. Distribute admin and partner credentials securely
3. Set up regular monitoring and backup procedures
4. Plan for scaling based on user adoption

**Questions or Issues?**
- Check this guide's troubleshooting section
- Review Digital Ocean documentation
- Contact Digital Ocean support for platform issues

---

*This deployment guide was created for the PRIVEE event management system. Last updated: December 2024*