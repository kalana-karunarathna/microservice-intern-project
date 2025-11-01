# Step 1: Use Node base image
FROM node:18

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Step 4: Copy code
COPY . .

# Step 5: Expose port
EXPOSE 4001

# Step 6: Start server
CMD ["node", "server.js"]
