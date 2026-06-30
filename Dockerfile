# ---------- Stage 1: Build ----------
# Use a lightweight Node image to build the Vite frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first so npm install is cached
# unless package.json/package-lock.json actually change
COPY package*.json ./
RUN npm install

# Now copy the rest of the source and build the frontend
COPY . .
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:20-alpine AS production

WORKDIR /app

# Only copy package files and install PRODUCTION deps (no devDependencies/vite)
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY index.js ./

# Copy the built frontend (dist) from the build stage
COPY --from=build /app/dist ./dist

# Create the logs directory and hand ownership to the restricted 'node' user
# (node:alpine images ship with a built-in non-root 'node' user)
RUN mkdir -p /app/logs && chown -R node:node /app

# Security Upgrade: drop root, run as the restricted node user
USER node

EXPOSE 5000

CMD ["node", "index.js"]
