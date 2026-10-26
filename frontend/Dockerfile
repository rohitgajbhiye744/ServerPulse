# Build stage: compile the React application
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies using the committed lockfile
COPY package*.json ./
RUN npm ci

# Copy frontend source and build for production
COPY . .
RUN npm run build

# Runtime stage: serve the production build with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80