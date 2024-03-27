FROM --platform=$BUILDPLATFORM node:20.12.0-bullseye-slim@sha256:54843cc7f68a02b00755dd878c7bc2e7e05cee31963aa5710f62baf29b6b9f83 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.12.0-bullseye-slim@sha256:54843cc7f68a02b00755dd878c7bc2e7e05cee31963aa5710f62baf29b6b9f83 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.12.0-bullseye-slim@sha256:54843cc7f68a02b00755dd878c7bc2e7e05cee31963aa5710f62baf29b6b9f83 AS runtime
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
