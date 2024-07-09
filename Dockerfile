FROM --platform=$BUILDPLATFORM node:20.15.0-bullseye-slim@sha256:8f6881869150049f8f1228a2f828c3dc1d0a012f136175f02ae46a83c0a1002b AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.15.0-bullseye-slim@sha256:8f6881869150049f8f1228a2f828c3dc1d0a012f136175f02ae46a83c0a1002b AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.15.0-bullseye-slim@sha256:8f6881869150049f8f1228a2f828c3dc1d0a012f136175f02ae46a83c0a1002b AS runtime
ENV NODE_ENV="production"
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
USER node

COPY --from=build /app/package.json /app/next.config.js ./
COPY --from=build /app/public/ ./public/
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

ENTRYPOINT ["node", "server.js"]
