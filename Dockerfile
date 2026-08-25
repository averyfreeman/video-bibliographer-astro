# Stage 1: Build Astro
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Unprivileged
FROM nginxinc/nginx-unprivileged:alpine-slim
# Copy the compiled Astro output to the NGINX default public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default unprivileged port
EXPOSE 8080
