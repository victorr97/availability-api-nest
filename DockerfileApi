# Use Node.js 20-slim as the base image (stable version)
# Note: This version has a known high vulnerability (CVE-2024-21538).
# The vulnerability does not affect this project directly, as cross-spawn 7.0.6 or higher is installed,
# which resolves the Regular Expression Denial of Service (ReDoS) issue present in 7.0.5.
FROM node:20-slim

WORKDIR /app

# Install 'procps' for hot-reload
RUN apt-get update && apt-get install -y procps

# Copy configuration files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose the port required for the app
EXPOSE 3002

# Command to run the application in development mode (hot reload)
CMD ["npm", "run", "start:dev"]