# DEPLOYMENT MANUAL SIN BOTÓN DEPLOY

## 🎯 OBJETIVO
Ejecutar el deployment del sistema PRIVEE directamente desde la terminal, sin usar el botón Deploy de Replit.

## 📋 MÉTODOS DISPONIBLES

### Método 1: Simulación Local de Producción (RECOMENDADO)

Este método ejecuta el servidor de producción localmente con las mismas condiciones que Replit usaría:

```bash
# 1. Construir el frontend
npm run build

# 2. Detener servidor de desarrollo
# Presiona Ctrl+C en la terminal del servidor actual

# 3. Configurar variables de entorno para producción
export REPLIT_DEPLOYMENT=1
export NODE_ENV=production
export PORT=5000

# 4. Ejecutar servidor de producción
node production-final.cjs
```

**Resultado:** Tu aplicación correrá en modo producción en `https://tu-repl.replit.dev`

### Método 2: Script de Deployment Automatizado

```bash
# Ejecutar el script que creé anteriormente
./deploy-production-final.sh
```

Este script automáticamente:
- Detiene servidores existentes
- Construye el frontend
- Configura variables de entorno
- Inicia el servidor de producción

### Método 3: Comando Directo de Producción

```bash
# Una sola línea que hace todo
pkill -f tsx && npm run build && REPLIT_DEPLOYMENT=1 NODE_ENV=production node production-final.cjs
```

## 🔧 PASO A PASO DETALLADO

### 1. Preparar el Entorno
```bash
# Verificar que el servidor simplificado existe
ls -la production-final.cjs

# Verificar que el frontend se puede construir
npm run build
ls -la dist/public/
```

### 2. Detener Servidor de Desarrollo
```bash
# Método A: Presionar Ctrl+C en la terminal activa
# Método B: Matar proceso específico
pkill -f "tsx server/index.ts"
pkill -f tsx
```

### 3. Configurar Variables de Producción
```bash
# Configurar entorno de producción
export REPLIT_DEPLOYMENT=1
export NODE_ENV=production
export PORT=5000

# Verificar que las variables están configuradas
echo "REPLIT_DEPLOYMENT: $REPLIT_DEPLOYMENT"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
```

### 4. Ejecutar Servidor de Producción
```bash
# Ejecutar el servidor optimizado
node production-final.cjs
```

**Output esperado:**
```
Starting production server...
Static files path: /home/runner/workspace/dist/public
✅ Static middleware configured
🚀 Production server running!
📍 Port: 5000
🔐 Admin: admin / Admin2025!
📁 Static: /home/runner/workspace/dist/public
```

## 🚀 SCRIPT COMPLETO DE UNA LÍNEA

```bash
#!/bin/bash
# Deployment completo en un comando
pkill -f tsx; npm run build && REPLIT_DEPLOYMENT=1 NODE_ENV=production PORT=5000 node production-final.cjs
```

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar que el Servidor Está Corriendo
```bash
# En otra terminal, verificar el proceso
ps aux | grep production-final

# Verificar que el puerto está abierto
curl http://localhost:5000/api/health
```

### 2. Probar Endpoints Críticos
```bash
# Health check
curl http://localhost:5000/api/health

# Login admin
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin2025!"}'

# Verificar frontend
curl -I http://localhost:5000/
```

## 🔄 GESTIÓN DEL PROCESO

### Ejecutar en Background
```bash
# Ejecutar en background para que siga corriendo
nohup node production-final.cjs > production.log 2>&1 &

# Ver el log en tiempo real
tail -f production.log
```

### Detener el Servidor
```bash
# Encontrar y detener el proceso
ps aux | grep production-final
kill [PID_DEL_PROCESO]

# O detener todos los procesos node
pkill -f production-final
```

### Reiniciar el Servidor
```bash
# Detener y reiniciar
pkill -f production-final && node production-final.cjs
```

## 🌐 ACCESO DESDE INTERNET

Cuando ejecutas el servidor manualmente, tu aplicación estará disponible en:
- **URL de desarrollo:** `https://tu-repl.replit.dev`
- **Puerto:** 5000
- **Health check:** `https://tu-repl.replit.dev/api/health`

## ⚠️ DIFERENCIAS CON DEPLOYMENT AUTOMÁTICO

| Aspecto | Deployment Manual | Deployment Automático |
|---------|------------------|---------------------|
| **Control** | Total control sobre el proceso | Replit maneja todo |
| **Variables** | Configuradas manualmente | Automáticas |
| **Logs** | Visibles en terminal | En dashboard de Replit |
| **Persistencia** | Solo mientras la terminal esté activa | Persistente automáticamente |
| **URL** | URL de desarrollo | URL de producción dedicada |

## 🔧 TROUBLESHOOTING

### Error: "Port already in use"
```bash
# Detener procesos que usan el puerto 5000
lsof -ti:5000 | xargs kill -9
```

### Error: "Permission denied"
```bash
# Hacer ejecutable el script
chmod +x deploy-production-final.sh
```

### Error: "Module not found"
```bash
# Verificar que node_modules existe
npm install
```

---

**Con este método tienes control total sobre el proceso de deployment y puedes ver exactamente qué está pasando en cada paso.**