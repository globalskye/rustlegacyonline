# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Build args for API URL and analytics
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ARG REACT_APP_GOOGLE_ANALYTICS_ID=
ENV REACT_APP_GOOGLE_ANALYTICS_ID=$REACT_APP_GOOGLE_ANALYTICS_ID
ARG REACT_APP_YANDEX_METRIKA_ID=
ENV REACT_APP_YANDEX_METRIKA_ID=$REACT_APP_YANDEX_METRIKA_ID

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
