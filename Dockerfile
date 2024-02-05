FROM --platform=$BUILDPLATFORM node:20.11.0-bullseye-slim@sha256:3ac772bcf5c1c0680d890f251c314acd253f4816149c758987ec9ede9e12a10c AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.11.0-bullseye-slim@sha256:3ac772bcf5c1c0680d890f251c314acd253f4816149c758987ec9ede9e12a10c AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.11.0-bullseye-slim@sha256:3ac772bcf5c1c0680d890f251c314acd253f4816149c758987ec9ede9e12a10c AS runtime
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
