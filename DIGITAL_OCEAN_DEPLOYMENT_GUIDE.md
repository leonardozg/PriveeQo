# PRIVEE - Digital Ocean App Platform Deployment Guide

This guide provides complete instructions for deploying the PRIVEE Quote System to Digital Ocean App Platform.

## Prerequisites

- ✅ Digital Ocean account with App Platform access
- ✅ GitHub repository with PRIVEE code
- ✅ PostgreSQL database (Digital Ocean Managed Database or external)

## 📂 Files You Need

The following files are included in this deployment package:

- `app-spec.yaml` - Digital Ocean App Platform specification
- `build-production.js` - Production build script
- `server/index-production.ts` - Optimized production server
- All existing application code

## 🚀 Step 1: Database Setup

### Option A: Digital Ocean Managed Database (Recommended)

1. **Create PostgreSQL Database:**
   ```bash
   # In Digital Ocean Control Panel:
   # 1. Go to Databases → Create Database
   # 2. Choose PostgreSQL 15
   # 3. Select appropriate size (Dev database for testing)
   # 4. Note the connection details
   ```

2. **Get Connection String:**
   The connection string format is:
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

### Option B: External PostgreSQL Database

If using an external PostgreSQL database, ensure:
- SSL connections are enabled
- Database is accessible from Digital Ocean
- Connection string is properly formatted

## 🔐 Step 2: Environment Variables Setup

You need these environment variables for production:

### Required Variables

```bash
# Database Connection
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Session Security (Generate with: node -p "require('crypto').randomBytes(64).toString('hex')")
SESSION_SECRET=your_64_character_random_string_here

# Application Environment
NODE_ENV=production
PORT=8080
```

### Generate Session Secret

Run this command locally to generate a secure session secret:

```bash
node -p "require('crypto').randomBytes(64).toString('hex')"
```

Copy the output and use it as your `SESSION_SECRET`.

## 📝 Step 3: Prepare app-spec.yaml

1. **Edit the app-spec.yaml file:**

   ```yaml
   # Replace these placeholders in app-spec.yaml:
   
   # Line 9: Update your repository details
   repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
   
   # Line 35: Add your session secret
   value: YOUR_SESSION_SECRET_REPLACE_THIS
   
   # Line 40: Add your database URL  
   value: YOUR_DATABASE_URL_REPLACE_THIS
   ```

2. **Verify Configuration:**
   - Repository name and branch are correct
   - Environment variables are set
   - Port is set to 8080
   - Build command uses `node build-production.js`
   - Run command is `cd dist && npm install --production && node index.js`

## 🏗️ Step 4: Digital Ocean Deployment

### Deploy via Digital Ocean Control Panel

1. **Create New App:**
   - Go to Digital Ocean Control Panel
   - Navigate to App Platform
   - Click "Create App"

2. **Choose Source:**
   - Select "GitHub"
   - Connect your GitHub account
   - Choose your repository
   - Select the main branch

3. **Upload App Spec:**
   - Click "Edit your App Spec"
   - Upload the `app-spec.yaml` file
   - OR paste the contents directly

4. **Configure Environment Variables:**
   - Add `DATABASE_URL` (mark as encrypted)
   - Add `SESSION_SECRET` (mark as encrypted)
   - Verify `NODE_ENV=production` and `PORT=8080`

5. **Review and Deploy:**
   - Review the configuration
   - Click "Create Resources"
   - Wait for deployment to complete

### Deploy via CLI (Alternative)

```bash
# Install Digital Ocean CLI
brew install doctl  # macOS
# or
wget https://github.com/digitalocean/doctl/releases/download/v1.92.0/doctl-1.92.0-linux-amd64.tar.gz

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec app-spec.yaml
```

## 🔍 Step 5: Verification

### Health Check

After deployment, verify the application:

```bash
# Replace YOUR_APP_URL with your actual Digital Ocean app URL
curl https://YOUR_APP_URL/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-20T10:00:00.000Z",
  "environment": "production",
  "port": "8080",
  "nodeVersion": "v22.x.x",
  "databaseConnected": true,
  "itemsCount": 0
}
```

### Test Application

1. **Access the application:** `https://YOUR_APP_URL`
2. **Test admin login:** `https://YOUR_APP_URL/admin`
3. **Check partner login:** `https://YOUR_APP_URL/partner/login`

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Error:** "Build failed with exit code 1"

**Solutions:**
- Check that `build-production.js` is in the root directory
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

#### 2. Database Connection Issues

**Error:** "Database health check failed"

**Solutions:**
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db?sslmode=require`
- Ensure database allows connections from Digital Ocean IP ranges
- Check SSL settings (`sslmode=require` is needed)

#### 3. Port Binding Issues

**Error:** "Port 5000 is already in use" or similar

**Solutions:**
- Ensure `app-spec.yaml` has `http_port: 8080`
- Verify `PORT=8080` environment variable
- Check that production server listens on `process.env.PORT`

#### 4. Session Errors

**Error:** Session-related errors

**Solutions:**
- Generate a new session secret (64+ characters)
- Mark `SESSION_SECRET` as encrypted in Digital Ocean
- Restart the application after adding the secret

#### 5. Static Files Not Served

**Error:** 404 errors for frontend routes

**Solutions:**
- Verify `dist/public/` directory exists after build
- Check that `index.html` is in `dist/public/`
- Ensure SPA fallback routes are configured

### Debug Logs

Check application logs in Digital Ocean:

1. Go to your app in Digital Ocean Control Panel
2. Navigate to "Runtime Logs"
3. Look for startup errors or runtime issues

## 📊 Performance Monitoring

### Scaling Configuration

The default configuration uses:
- 1 instance
- 1 vCPU
- 1GB RAM

For production, consider upgrading to:
```yaml
instance_size_slug: apps-s-2vcpu-4gb  # 2 vCPU, 4GB RAM
instance_count: 2                     # 2 instances for redundancy
```

### Database Monitoring

Monitor your database performance:
- Connection count
- Query performance
- Storage usage

## 🔒 Security Checklist

- ✅ Database uses SSL connections
- ✅ Session secret is cryptographically secure
- ✅ Environment variables are marked as encrypted
- ✅ Application runs on HTTPS (automatic with Digital Ocean)
- ✅ Security headers are set in production server

## 📞 Support

If you encounter issues not covered in this guide:

1. Check Digital Ocean App Platform documentation
2. Review application logs in Digital Ocean Control Panel
3. Verify all environment variables are correctly set
4. Test the build process locally: `node build-production.js`

## 🎯 Success Checklist

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Health check endpoint returns "healthy"
- ✅ Database connection is established
- ✅ Frontend loads correctly
- ✅ Admin panel is accessible
- ✅ Partner login works
- ✅ Quote generation functions properly

---

**Built for Digital Ocean App Platform | PRIVEE Quote System v1.0**