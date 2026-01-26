# Dashboard Builder POC - Frontend
# Multi-stage build for optimized production image
# Build stage: install deps and build Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Runtime stage: minimal image with just the app
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose port for frontend
EXPOSE 3000

# Health check so Docker knows when app is ready
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start Next.js in production mode
CMD ["npm", "run", "start"]
