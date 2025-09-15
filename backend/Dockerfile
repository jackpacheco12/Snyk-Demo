# Build stage
FROM gcr.io/google.com/cloudsdktool/cloud-sdk:alpine AS builder

# Install Node.js
RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM gcr.io/google.com/cloudsdktool/cloud-sdk:alpine

# Install Node.js
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "server.js"]