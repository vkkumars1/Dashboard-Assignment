# Dashboard Builder POC - Backend
# Multi-stage build for a lean production image
# Build stage: compile TypeScript to JavaScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDeps for TypeScript compiler)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Runtime stage: only what we need to run the app
FROM node:20-alpine

WORKDIR /app

# Copy runtime dependencies only (saves ~200MB)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Expose port for backend API
EXPOSE 3001

# Health check to verify API is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the compiled app
CMD ["node", "dist/server.js"]
