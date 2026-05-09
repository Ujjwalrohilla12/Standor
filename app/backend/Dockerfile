FROM node:20-alpine
WORKDIR /app

# Install production dependencies
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --production --silent --prefer-offline

# Copy source
COPY . .

EXPOSE 4000

# Start server
CMD ["node", "src/server.js"]
