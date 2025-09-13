#!/bin/bash

# HTTP 500 Error Fix - Production Deployment Script
# Following Instructions.md Solution A: Use Simplified Production Server

echo "🚀 Starting HTTP 500 Error Fix Deployment..."

# Kill any existing servers to prevent conflicts
echo "🔧 Stopping existing servers..."
pkill -f tsx 2>/dev/null || true
pkill -f "server/index.ts" 2>/dev/null || true
pkill -f "production-final" 2>/dev/null || true
sleep 2

# Build frontend (required for deployment)
echo "🔨 Building frontend..."
npm run build

# Verify build output exists
if [ ! -d "dist/public" ]; then
    echo "❌ Build failed - dist/public directory not found"
    exit 1
fi

echo "✅ Frontend build complete"
echo "📁 Static files: $(ls -la dist/public/)"

# Set production environment variables
export REPLIT_DEPLOYMENT=1
export NODE_ENV=production

# Start simplified production server (prevents HTTP 500 errors)
echo "🚀 Starting simplified production server..."
echo "🔧 Server: production-final.cjs"
echo "🌍 Environment: production"
echo "📍 Port: 5000"
echo "🔐 Admin: admin/Admin2025!"

# Start the server
node production-final.cjs