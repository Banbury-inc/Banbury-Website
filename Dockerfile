# Use an official Node.js image
FROM node:16-bullseye

# Set the working directory to /app
WORKDIR /app

# Copy only the frontend folder into the container
COPY frontend ./frontend

# Navigate to the frontend directory
WORKDIR /app/frontend

# Install dependencies
RUN npm install

# Expose port 80
EXPOSE 80

# Set environment variable for the port
ENV PORT=80

# Start the frontend application
CMD ["npm", "start"]

