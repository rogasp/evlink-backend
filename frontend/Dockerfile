# syntax=docker/dockerfile:1

# 1) Build
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Kopiera hela frontend-källan (vi förlitar oss på .dockerignore för att slippa node_modules/.next)
COPY . .

# Installera beroenden baserat på vilket låsfil som finns
RUN if [ -f yarn.lock ]; then \
      corepack enable && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm i; \
    fi

# Bygg Next till standalone
# Se till att next.config.mjs innehåller:  export default { output: 'standalone' }
RUN npm run build

# 2) Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
USER node

# Plocka in standalone-servern + statiska filer
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
