#!/bin/bash

echo "🔧 Simple Production Deployment Test"

# Build the project
npm run build

# Run production server on different port
PORT=9999 NODE_ENV=production REPLIT_DEPLOYMENT=1 npx tsx server/index-production.ts &
PID=$!

echo "Server PID: $PID"
sleep 5

# Test endpoints
echo "Testing health..."
curl -f http://localhost:9999/api/health && echo " ✅ Health OK" || echo " ❌ Health FAIL"

echo "Testing home page..."
curl -f http://localhost:9999/ > /dev/null && echo "✅ Home OK" || echo "❌ Home FAIL"

# Cleanup
kill $PID 2>/dev/null || echo "Process cleanup"
echo "Test complete"