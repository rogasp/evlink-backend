# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1   # lämna NODE_ENV tills efter build

# Installera deps (inkl. dev) via lockfil
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Kopiera kod och bygg
COPY . .
RUN npm run build

# Runtime
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
