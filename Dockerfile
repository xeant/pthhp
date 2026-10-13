FROM node:22-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://plextype:plextype_password@postgres:5432/plextype?schema=public
ENV JWT_SECRET=build-time-jwt-secret-build-time-jwt-secret
ENV SECRET_KEY=build-time-secret-key-build-time-secret-key
ENV ACCESSTOKEN_EXPIRES_IN=1h
ENV REFRESHTOKEN_EXPIRES_IN=4h

RUN npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/core/prisma ./src/core/prisma
COPY --from=builder /app/src/core/utils/db/generated ./src/core/utils/db/generated
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
  && mkdir -p /app/storage/uploads

VOLUME ["/app/storage"]

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
