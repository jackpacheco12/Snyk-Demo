# Build stage
FROM alpine:3.18 AS builder

# Install Node.js
RUN apk add --no-cache nodejs=18.20.4-r0 npm

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM alpine:3.18

# Install Node.js
RUN apk add --no-cache nodejs=18.20.4-r0 npm

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

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