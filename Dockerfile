# Use the official lightweight Node.js 20 image.
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source code inside the Docker image
COPY . .

# Expose the correct port for Cloud Run (defaults to 8080)
EXPOSE 8080

# Run the server
CMD ["npm", "start"]
