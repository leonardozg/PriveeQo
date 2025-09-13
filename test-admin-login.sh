#!/bin/bash

echo "🔐 PRUEBA ESPECÍFICA DE LOGIN ADMINISTRADOR"
echo "==========================================="

# Build
echo "1. Building project..."
npm run build > /dev/null 2>&1
echo "✅ Build completed"

# Start server
echo ""
echo "2. Starting production server..."
PORT=7777 NODE_ENV=production node server/production-server.cjs &
PID=$!
echo "Server PID: $PID"
sleep 4

# Test health first
echo ""
echo "3. Testing server health..."
HEALTH=$(curl -s http://localhost:7777/api/health)
echo "Health response: $HEALTH"

# Test session endpoint
echo ""
echo "4. Testing session endpoint..."
SESSION=$(curl -s http://localhost:7777/api/debug/session)
echo "Session info: $SESSION"

# Test admin auth check (should be unauthorized)
echo ""
echo "5. Testing unauthenticated admin check..."
UNAUTH=$(curl -s -w "%{http_code}" http://localhost:7777/api/admin/me)
echo "Unauthenticated response (should be 401): $UNAUTH"

# Test invalid login
echo ""
echo "6. Testing invalid login..."
INVALID=$(curl -s -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong"}' \
  http://localhost:7777/api/admin/login)
echo "Invalid login response (should be 401): $INVALID"

# Test valid login
echo ""
echo "7. Testing VALID ADMIN LOGIN..."
LOGIN=$(curl -s -c cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin2025!"}' \
  http://localhost:7777/api/admin/login)
echo "Login response: $LOGIN"

# Check if login was successful
if [[ $LOGIN == *"success"* ]]; then
  echo "✅ Login successful!"
  
  # Test authenticated session
  echo ""
  echo "8. Testing authenticated session check..."
  AUTH_CHECK=$(curl -s -b cookies.txt http://localhost:7777/api/admin/me)
  echo "Authenticated check: $AUTH_CHECK"
  
  if [[ $AUTH_CHECK == *"authenticated"* ]]; then
    echo "✅ Session working correctly!"
  else
    echo "❌ Session not working"
  fi
  
  # Test logout
  echo ""
  echo "9. Testing logout..."
  LOGOUT=$(curl -s -b cookies.txt -X POST http://localhost:7777/api/admin/logout)
  echo "Logout response: $LOGOUT"
  
  # Test after logout
  echo ""
  echo "10. Testing after logout..."
  AFTER_LOGOUT=$(curl -s -w "%{http_code}" -b cookies.txt http://localhost:7777/api/admin/me)
  echo "After logout (should be 401): $AFTER_LOGOUT"
  
else
  echo "❌ Login failed!"
  echo "Response: $LOGIN"
fi

# Cleanup
kill $PID 2>/dev/null
rm -f cookies.txt

echo ""
echo "==========================================="
if [[ $LOGIN == *"success"* && $AUTH_CHECK == *"authenticated"* ]]; then
  echo "🎉 ADMIN LOGIN TEST SUCCESSFUL"
  echo "✅ No error 500 detected"
  echo "✅ All authentication flows working"
else
  echo "❌ ADMIN LOGIN TEST FAILED"
fi
echo "==========================================="