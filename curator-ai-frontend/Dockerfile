# Step 1: Build the Vite app
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the app code
COPY . .

# Set the API URL for production build (can be overridden)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built static files to Nginx HTML folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx config with our own
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
