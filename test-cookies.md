# Guía para Diagnosticar Problemas de Cookies

## 1. Accede a la Herramienta de Debug

Visita: `http://tu-dominio.com/debug-cookies`

Esta página te mostrará:
- ✅ Estado de cookies del navegador
- ✅ Información de sesión actual
- ✅ Test de login para admin y partner
- ✅ Headers y configuración del navegador

## 2. Problemas Comunes de Cookies

### A. Cookies Deshabilitadas
**Síntomas:**
- Error: "Test de Cookie: FALLÓ"
- No se pueden hacer logins

**Solución:**
1. Habilitar cookies en navegador
2. Verificar que no esté en modo incógnito
3. Limpiar cache y cookies del sitio

### B. Dominio Incorrecto
**Síntomas:**
- Cookies no persisten entre páginas
- Logout automático

**Solución:**
- Verificar que el dominio coincida
- Check en herramientas de desarrollo (F12)

### C. HTTPS vs HTTP
**Síntomas:**
- Cookies funcionan en desarrollo pero no en producción

**Solución:**
- Verificar configuración secure cookies
- Check mixed content warnings

## 3. Tests Específicos

### Test Admin Login
```
Usuario: admin
Contraseña: Admin2025!
```

### Test Partner Login
```
Usuario: Alonso1
Contraseña: socio123
```

## 4. Verificación Manual

1. **Abrir DevTools (F12)**
2. **Application/Storage tab**
3. **Cookies section**
4. Verificar que aparezcan cookies de sesión

## 5. Limpiar Estado

Si hay problemas persistentes:
1. Usar botón "Limpiar Todas las Cookies"
2. Recargar página completamente
3. Intentar login nuevamente

## 6. Información de Debug

La página debug-cookies mostrará:
- User Agent del navegador
- Estado de cookies enabled/disabled
- Todas las cookies actuales
- Información de sesión del servidor
- Headers de request