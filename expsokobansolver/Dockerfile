# syntax=docker/dockerfile:1
FROM node:22-alpine

# Install Python (example: Python 3.10)
RUN apk add --no-cache python3 py3-pip

# Set python3 as default python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# copy app files
WORKDIR /app
COPY . .
RUN npm ci --only=production

CMD ["node", "app.js"]

EXPOSE 80