FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.js ./

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve for production
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["serve", "-s", "dist", "-l", "3000"]
