# Build app:
FROM node:14-alpine3.13 AS builder

WORKDIR /app
COPY ./package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./ ./
RUN yarn build


# Build image:
FROM node:14-alpine3.13 AS runner
RUN apk add --update --no-cache curl

WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/.next
USER docker

ENV NODE_ENV=production
EXPOSE 8000
ENTRYPOINT ["yarn", "start"]
