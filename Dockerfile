# Dockerfile
FROM node:18-alpine

# Instalar dumb-init para manejo de procesos
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Cambiar permisos al usuario nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Argument para el entorno
ARG NODE_ENV=dev
ENV NODE_ENV=$NODE_ENV

# Configurar variables de entorno según el ambiente
ENV PORT=4000

# Exponer puerto
EXPOSE 4000

# Comando para iniciar la aplicación
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]