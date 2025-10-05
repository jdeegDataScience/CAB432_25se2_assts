# syntax=docker/dockerfile:1
FROM node:22-alpine

# Install Python (example: Python 3.10)
RUN apk add python3 py3-pip

# Set python3 as default python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# set workdir
WORKDIR /app

# Copy only package files first (cache npm install)
COPY package*.json ./
RUN npm ci --only=production

# Copy rest of app files
COPY . .

# Start the app
CMD ["node", "app.js"]

EXPOSE 80