# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install all dependencies to build the frontend
RUN npm install

# Copy the rest of the project files
COPY . .

# Define environment variables (if needed)
ENV NODE_ENV=production

# Build the frontend
RUN npm run build

# Remove dev dependencies to keep the final image small
RUN npm prune --omit=dev

# Expose the port the Express app uses
EXPOSE 3000

# Set the command to start the script
CMD ["npm", "start"]
