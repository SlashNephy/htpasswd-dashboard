FROM --platform=$BUILDPLATFORM node:22.19.0-bullseye-slim@sha256:535c6223132f2c4b874d604aab6233c41e968ec9a0e9b11bf021b920abc972b2 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.19.0-bullseye-slim@sha256:535c6223132f2c4b874d604aab6233c41e968ec9a0e9b11bf021b920abc972b2 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.19.0-bullseye-slim@sha256:535c6223132f2c4b874d604aab6233c41e968ec9a0e9b11bf021b920abc972b2 AS runtime
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
