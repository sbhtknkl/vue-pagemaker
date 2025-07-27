# Vue PageMaker Docker Configuration
FROM nginx:alpine

# Install Node.js for development tools (optional)
RUN apk add --no-cache nodejs npm

# Create working directory
WORKDIR /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy project files
COPY . /usr/share/nginx/html/

# Create logs directory
RUN mkdir -p /var/log/nginx

# Install live-reload tool (browser-sync alternative)
RUN npm install -g nodemon

# Expose port
EXPOSE 80

# Start nginx with file watching
CMD ["nginx", "-g", "daemon off;"] 