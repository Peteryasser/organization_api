# Use a Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies first (using package.json and package-lock.json to leverage Docker layer caching)
COPY package*.json ./

RUN npm install

# Copy the rest of the app code
COPY . .

# Start the application
CMD [ "npm", "run", "start:prod" ]