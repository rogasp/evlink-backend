# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# 1) Installera deps med lockfil (snabbare/stabilare)
COPY package*.json ./
# Tips: --no-audit/--no-fund snabbar på och ger mindre brus
RUN npm ci --no-audit --no-fund

# 2) Kopiera koden och bygg
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
