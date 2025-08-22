# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

WORKDIR /app

# Build arguments (värden kommer via docker-compose → Coolify env)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY


# Gör dem synliga under build (Next prerendrar)
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}

# Installera deps via lockfil
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Kopiera kod & bygg
COPY . .
RUN npm run build

# Runtime
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
