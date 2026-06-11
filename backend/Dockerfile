# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Prisma needs OpenSSL present to generate/run the engine.
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

# Bring over the generated Prisma client, schema/migrations, and compiled JS.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 4000

# Apply migrations on boot, then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
