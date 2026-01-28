# Build Stage for Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build Stage for Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# Ensure TypeScript is compiled
RUN npm run build

# Final Production Stage
FROM node:20-alpine
WORKDIR /app

# Copy backend compiled code and dependencies
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Copy frontend static export
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Set environment variables
ENV PORT=8000
ENV NODE_ENV=production

# Expose the port
EXPOSE 8000

# Start the server
CMD ["node", "backend/dist/server.js"]
