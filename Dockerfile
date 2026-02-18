# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci

ARG APP_NAME
RUN npx nest build ${APP_NAME}

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

ARG APP_NAME
COPY --from=builder /app/dist ./dist

ENV APP_NAME=${APP_NAME}
EXPOSE 3000

# chạy đúng app (Nest build output: dist/apps/<app>/main.js)
CMD ["sh", "-c", "node dist/apps/$APP_NAME/main.js"]
