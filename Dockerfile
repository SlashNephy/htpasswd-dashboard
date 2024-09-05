FROM --platform=$BUILDPLATFORM node:20.17.0-bullseye-slim@sha256:1ae8f0e420a098d667fc023e0e68c5409e215bb805e2cf2fd52e17eac0924fb0 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.17.0-bullseye-slim@sha256:1ae8f0e420a098d667fc023e0e68c5409e215bb805e2cf2fd52e17eac0924fb0 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.17.0-bullseye-slim@sha256:1ae8f0e420a098d667fc023e0e68c5409e215bb805e2cf2fd52e17eac0924fb0 AS runtime
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
