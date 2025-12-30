# Multi-stage build for Next.js standalone
FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOME=/home/nextjs
ENV NPM_CONFIG_CACHE=/home/nextjs/.npm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs --home /home/nextjs
RUN mkdir -p /home/nextjs/.npm && chown -R nextjs:nodejs /home/nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Essential Prisma modules and binaries for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Using the local binary path directly helps avoid WASM path resolution issues
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --accept-data-loss && node server.js"]
