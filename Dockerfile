# Etapa base
FROM node:20.11-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@latest --activate

WORKDIR /app

# Etapa de dependencias
FROM base AS deps

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias de producción
RUN pnpm install --frozen-lockfile

# Etapa de build
FROM base AS builder

WORKDIR /app

# Copiar node_modules desde la etapa deps
COPY --from=deps /app/node_modules ./node_modules

# Copiar el resto del código fuente
COPY . .

# Configurar variables de entorno para producción
ENV NODE_ENV=production

RUN pnpm run build:icons

# Construir el proyecto
RUN pnpm run build

# Etapa final
FROM node:20.11-alpine AS runner

WORKDIR /app

# Configurar variables de entorno para producción
ENV NODE_ENV=production

# Crear un usuario seguro
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Copiar archivos necesarios desde la etapa builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario seguro
USER nextjs

# Exponer el puerto de la aplicación
EXPOSE 8083
ENV PORT=8083
ENV HOSTNAME=0.0.0.0

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
