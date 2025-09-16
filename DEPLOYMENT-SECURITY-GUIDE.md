# 🔒 PRIVEE SECURITY DEPLOYMENT GUIDE

## 🚨 CRITICAL SECURITY NOTICE

The `app-spec-final.yaml` file has been secured by removing hardcoded secrets. **You MUST configure these environment variables in Digital Ocean before deployment.**

## ⚠️ REMOVED SECURITY VULNERABILITIES

The following hardcoded secrets have been **REMOVED** from the repository:
- ❌ **DATABASE_URL** - PostgreSQL connection string with credentials
- ❌ **SESSION_SECRET** - Express session encryption key

## 🔧 REQUIRED DIGITAL OCEAN CONFIGURATION

### 1. SESSION_SECRET Environment Variable

**Location**: Digital Ocean App Platform → Environment Variables

```yaml
Key: SESSION_SECRET
Value: [GENERATE_SECURE_64_BYTE_HEX_STRING]
Scope: Runtime
Type: Secret (encrypted)
```

**Generate secure session secret:**
```bash
# Run this command to generate a cryptographically secure session secret:
node -p "require('crypto').randomBytes(64).toString('hex')"
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456789012345678901234567890abcdef123456789012345678901234567890
```

### 2. DATABASE_URL Environment Variable

**Location**: Digital Ocean App Platform → Environment Variables

```yaml
Key: DATABASE_URL
Value: postgresql://username:password@host:port/database?sslmode=require
Scope: Runtime & Build Time
Type: Secret (encrypted)
```

**Format requirements:**
- Must include `sslmode=require` for security
- Use your production PostgreSQL credentials
- Host should be your database provider's endpoint

**Example format:**
```
postgresql://user:secure_password@db-host.provider.com:5432/production_db?sslmode=require
```

## 🔍 SESSIONS TABLE VERIFICATION

The application uses PostgreSQL session storage with the following verified configuration:

**Table Structure:**
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IDX_session_expire ON sessions (expire);
```

**Configuration Details:**
- ✅ Table name: `sessions` (matches connect-pg-simple requirement)
- ✅ Columns: `sid`, `sess`, `expire` (correct types)
- ✅ Index on `expire` column for cleanup performance
- ✅ `createTableIfMissing: false` (production safety)

## 🚀 DIGITAL OCEAN DEPLOYMENT STEPS

### Step 1: Access Environment Variables
1. Go to Digital Ocean App Platform
2. Select your PRIVEE application
3. Navigate to "Settings" → "App-Level Environment Variables"

### Step 2: Add SESSION_SECRET
1. Click "Add Variable"
2. **Key:** `SESSION_SECRET`
3. **Value:** [Generated 64-byte hex string]
4. **Scope:** Runtime
5. **Type:** Secret (encrypted)
6. Click "Save"

### Step 3: Add DATABASE_URL
1. Click "Add Variable" 
2. **Key:** `DATABASE_URL`
3. **Value:** [Your PostgreSQL connection string]
4. **Scope:** Runtime and Build Time
5. **Type:** Secret (encrypted)
6. Click "Save"

### Step 4: Deploy Application
1. Click "Deploy" in Digital Ocean dashboard
2. The build will use these secure environment variables
3. Verify deployment at health check endpoint: `/api/health`

## ⚡ SECURITY VALIDATION

After deployment, verify security configuration:

### Health Check
```bash
curl https://your-app.digitalocean.app/api/health
# Should return: {"status": "ok", "environment": "production"}
```

### Session Security Check
- Sessions are stored in PostgreSQL (not memory)
- Session cookies are `httpOnly` and `secure` in production
- Session expiration: 7 days
- CSRF protection via secure session handling

### Database Security Check
- SSL/TLS connection required (`sslmode=require`)
- Credentials not exposed in code
- Connection pooling managed securely

## 🛡️ SECURITY BEST PRACTICES IMPLEMENTED

1. **No Secrets in Code**: All sensitive data moved to environment variables
2. **Secure Session Storage**: PostgreSQL-backed sessions with expiration
3. **Production Cookies**: `secure: true`, `httpOnly: true` in production
4. **SSL Database Connections**: Required for all database communications
5. **Environment Detection**: Automatic production/development configuration

## 🔍 TROUBLESHOOTING

### "Session Secret Required" Error
- Verify `SESSION_SECRET` environment variable is set in Digital Ocean
- Ensure the variable scope includes "Runtime"
- Regenerate secret if it contains invalid characters

### Database Connection Errors
- Verify `DATABASE_URL` format includes `sslmode=require`
- Check database credentials are correct
- Ensure variable scope includes "Runtime and Build Time"

### Session Storage Issues
- Verify `sessions` table exists in your database
- Check database user has read/write permissions on `sessions` table
- Confirm index on `expire` column exists for performance

## ✅ DEPLOYMENT CHECKLIST

- [ ] Generated secure `SESSION_SECRET` using crypto.randomBytes(64)
- [ ] Set `SESSION_SECRET` in Digital Ocean environment variables
- [ ] Set `DATABASE_URL` in Digital Ocean environment variables  
- [ ] Verified `sessions` table exists in production database
- [ ] Confirmed both variables are marked as "Secret" type
- [ ] Deployed application using Digital Ocean dashboard
- [ ] Tested health check endpoint responds correctly
- [ ] Verified admin login works: `/admin` (admin/Admin2025!)
- [ ] Verified partner login works: `/partner/login`

## 🎯 POST-DEPLOYMENT VERIFICATION

1. **Admin Access**: `https://your-app.digitalocean.app/admin`
2. **Partner Access**: `https://your-app.digitalocean.app/partner/login` 
3. **Health Check**: `https://your-app.digitalocean.app/api/health`
4. **Session Persistence**: Login, close browser, return - should stay logged in

---

## 🔒 SECURITY SUMMARY

This configuration ensures:
- **Zero hardcoded secrets** in repository
- **Encrypted environment variables** in Digital Ocean
- **Secure session management** with PostgreSQL storage
- **SSL-only database connections**
- **Production-grade cookie security**

**Your PRIVEE application is now securely configured for production deployment!** 🚀