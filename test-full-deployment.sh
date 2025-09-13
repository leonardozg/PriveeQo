#!/bin/bash

echo "🚀 PRUEBA COMPLETA DE DEPLOYMENT"
echo "=================================="

# 1. Build del proyecto
echo "1. Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# 2. Verificar archivos necesarios
echo ""
echo "2. Verificando archivos críticos..."
FILES=("dist/public/index.html" "dist/public/assets" "server/simple-server.cjs")
for file in "${FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# 3. Test servidor en condiciones de producción
echo ""
echo "3. Testing production server..."
PORT=8080 NODE_ENV=production REPLIT_DEPLOYMENT=1 node server/simple-server.cjs &
PID=$!
echo "Server PID: $PID"
sleep 4

# 4. Tests de endpoints críticos
echo ""
echo "4. Testing critical endpoints..."

# Health check
HEALTH=$(curl -s -w "%{http_code}" http://localhost:8080/api/health)
if [[ $HEALTH == *"200" ]]; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed: $HEALTH"
    kill $PID 2>/dev/null
    exit 1
fi

# Frontend
FRONTEND=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/)
if [[ $FRONTEND == "200" ]]; then
    echo "✅ Frontend serving correctly"
else
    echo "❌ Frontend failed: $FRONTEND"
    kill $PID 2>/dev/null
    exit 1
fi

# Admin route
ADMIN=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/admin)
if [[ $ADMIN == "200" ]]; then
    echo "✅ Admin route working"
else
    echo "❌ Admin route failed: $ADMIN"
    kill $PID 2>/dev/null
    exit 1
fi

# Partner route
PARTNER=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/partner)
if [[ $PARTNER == "200" ]]; then
    echo "✅ Partner route working"
else
    echo "❌ Partner route failed: $PARTNER"
    kill $PID 2>/dev/null
    exit 1
fi

# 5. Test de contenido HTML
echo ""
echo "5. Testing HTML content..."
HTML_CONTENT=$(curl -s http://localhost:8080/)
if [[ $HTML_CONTENT == *"PRIVEE"* && $HTML_CONTENT == *"DOCTYPE"* ]]; then
    echo "✅ HTML content valid"
else
    echo "❌ HTML content invalid"
    kill $PID 2>/dev/null
    exit 1
fi

# 6. Cleanup y resultado final
kill $PID 2>/dev/null
wait $PID 2>/dev/null

echo ""
echo "=================================="
echo "🎉 DEPLOYMENT TEST SUCCESSFUL"
echo "=================================="
echo "✅ Build working"
echo "✅ Static files present" 
echo "✅ Health endpoint responding"
echo "✅ Frontend serving correctly"
echo "✅ All routes working"
echo "✅ HTML content valid"
echo ""
echo "🚀 READY FOR PRODUCTION DEPLOYMENT"