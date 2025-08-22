# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Installera deps via lockfil (npm)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Kopiera kod och bygg
COPY . .
RUN npm run build

# Runtime
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
