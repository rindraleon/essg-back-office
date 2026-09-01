# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only package files to leverage layer caching
COPY back-office/package*.json ./

# Install dependencies (production + dev for build)
RUN npm ci

# Copy source code
COPY back-office/src ./src
COPY back-office/*.json ./
COPY back-office/*.ts ./
COPY back-office/*.tsx ./
COPY back-office/*.js ./
COPY back-office/index.html ./
COPY back-office/public ./public
COPY back-office/@ ./@ || true

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["serve", "-l", "3001", "-s", "dist"]
