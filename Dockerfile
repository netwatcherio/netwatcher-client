# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 3000

# Define command to run the app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
