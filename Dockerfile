# Use a Debian-based Python image
FROM python:3.11-slim-bullseye

# Install Redis and build tools
RUN apt-get update && apt-get install -y \
    redis-server \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    && apt-get clean

# Set the working directory to /app
WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# Copy only the backend directory's requirements file
COPY backend/requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Copy the rest of the backend directory
COPY backend/ .

# Expose the ports for the application
EXPOSE 8080 8082

# Start Redis and both servers
CMD redis-server --daemonize yes && \
    python3 manage.py runserver 0.0.0.0:8080 --noreload

