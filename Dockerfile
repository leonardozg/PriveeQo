# Dockerfile para DigitalOcean App Platform
# Soluciona problemas de buildpack con deterministic build

FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias (dev + prod)
RUN npm ci

# Copiar código fuente
COPY . .

# Build frontend y backend
RUN node build-production.js

# --- Runtime Stage ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Configurar ambiente de producción
ENV NODE_ENV=production

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist ./dist

# Puerto para DigitalOcean
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Comando de inicio - servidor compilado
CMD ["node", "dist/index.js"]