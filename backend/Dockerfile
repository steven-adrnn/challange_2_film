# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port (default 5000 or from env)
EXPOSE 5000

# Start the server
CMD ["node", "app.js"]
