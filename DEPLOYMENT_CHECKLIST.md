# PRIVEE Digital Ocean Deployment Checklist

Use this checklist to ensure a successful deployment to Digital Ocean App Platform.

## 📋 Pre-Deployment Checklist

### Repository Setup
- [ ] Code is pushed to GitHub repository
- [ ] Repository is accessible (public or granted access)
- [ ] Main branch contains latest code
- [ ] All files are committed and pushed

### Files Verification
- [ ] `app-spec.yaml` exists in root directory
- [ ] `build-production.js` exists in root directory  
- [ ] `server/index-production.ts` exists
- [ ] `package.json` contains all required dependencies

### Database Preparation
- [ ] PostgreSQL database is created
- [ ] Database connection string is available
- [ ] Database allows external connections
- [ ] SSL mode is enabled for security

### Environment Variables Ready
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - 64+ character random string
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Set to "8080"

## 🔧 Configuration Checklist

### app-spec.yaml Updates
- [ ] GitHub repository name is correct
- [ ] Branch name is set (usually "main")
- [ ] Build command: `node build-production.js`
- [ ] Run command: `cd dist && npm install --production && node index.js`
- [ ] HTTP port is set to 8080
- [ ] Environment variables are properly defined
- [ ] Database URL is marked as SECRET
- [ ] Session secret is marked as SECRET

### Security Configuration
- [ ] Session secret is cryptographically secure (generated with crypto.randomBytes)
- [ ] Database connection uses SSL (sslmode=require)
- [ ] No hardcoded secrets in code
- [ ] Environment variables are encrypted in Digital Ocean

## 🚀 Deployment Checklist

### Digital Ocean Setup
- [ ] Digital Ocean account is active
- [ ] App Platform is accessible
- [ ] GitHub account is connected to Digital Ocean

### Deployment Process
- [ ] New app created in Digital Ocean App Platform
- [ ] Repository connected successfully
- [ ] App spec uploaded/pasted correctly
- [ ] Environment variables added and encrypted
- [ ] Resource allocation is appropriate

### Build Verification
- [ ] Build process starts successfully
- [ ] Frontend build completes (Vite)
- [ ] Backend build completes (esbuild)
- [ ] No build errors in logs
- [ ] Dependencies install correctly

## ✅ Post-Deployment Verification

### Health Checks
- [ ] Health endpoint responds: `/api/health`
- [ ] Response shows "healthy" status
- [ ] Database connection is confirmed
- [ ] Node.js version is correct (22+)

### Functionality Tests
- [ ] Application loads at provided URL
- [ ] Frontend renders correctly
- [ ] Admin panel is accessible (`/admin`)
- [ ] Partner login page works (`/partner/login`)
- [ ] API endpoints respond correctly

### Performance Checks
- [ ] Page load times are acceptable
- [ ] Static assets serve correctly
- [ ] No 404 errors for expected routes
- [ ] Memory usage is within limits

## 🐛 Troubleshooting Checklist

### If Build Fails
- [ ] Check build logs for specific errors
- [ ] Verify all dependencies are in package.json
- [ ] Ensure Node.js version compatibility
- [ ] Test build locally: `node build-production.js`

### If App Won't Start
- [ ] Check runtime logs for startup errors
- [ ] Verify environment variables are set
- [ ] Confirm port binding (should be 8080)
- [ ] Check database connectivity

### If Database Issues
- [ ] Verify connection string format
- [ ] Test database accessibility
- [ ] Check SSL settings
- [ ] Confirm database exists and has permissions

### If Static Files Missing
- [ ] Verify build output includes `dist/public/`
- [ ] Check that `index.html` exists
- [ ] Confirm static file serving configuration
- [ ] Test local build output

## 📊 Success Metrics

### Technical Metrics
- [ ] Build time < 5 minutes
- [ ] App startup time < 30 seconds
- [ ] Health check response time < 2 seconds
- [ ] Memory usage < 512MB (for basic tier)

### Functional Metrics
- [ ] All pages load successfully
- [ ] Admin functions work correctly
- [ ] Partner authentication functions
- [ ] Quote generation and PDF export work
- [ ] CSV import functionality works

## 🔄 Maintenance Checklist

### Regular Monitoring
- [ ] Check application logs weekly
- [ ] Monitor resource usage
- [ ] Verify health checks pass
- [ ] Test critical functionality monthly

### Updates and Patches
- [ ] Keep dependencies updated
- [ ] Monitor security advisories
- [ ] Test changes in staging first
- [ ] Document any configuration changes

---

**Completion Date:** ___________

**Deployed by:** ___________

**App URL:** ___________

**Database:** ___________

**Notes:** 
```
_________________________________________________
_________________________________________________
_________________________________________________
```

✅ **Deployment Successful!** All checklist items completed.