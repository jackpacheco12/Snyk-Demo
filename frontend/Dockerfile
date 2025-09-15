# Multi-stage build for production
FROM alpine:3.18 AS build

# Install Node.js 14
RUN apk add --no-cache nodejs=18.20.4-r0 npm

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app with environment settings
ENV CI=false
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]