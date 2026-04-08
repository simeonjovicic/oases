# ============================================
# Backend Dockerfile - Node.js + Express
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --production

# Copy source code and assets
COPY src/ ./src/
COPY assets/ ./assets/
COPY db/ ./db/
COPY .babelrc ./

# Install babel for transpilation (needed at runtime with babel-node)
RUN npm install --save-dev @babel/cli @babel/core @babel/node @babel/preset-env

EXPOSE 5000

# Start the server with babel-node
CMD ["npx", "babel-node", "src/server.js"]
