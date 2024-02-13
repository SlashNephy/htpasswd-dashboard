FROM --platform=$BUILDPLATFORM node:20.11.0-bullseye-slim@sha256:21fe81f52728a8fdcb1220be67a0dd2eca0c2603d84f7afbe73b6ad22c10e14b AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.11.0-bullseye-slim@sha256:21fe81f52728a8fdcb1220be67a0dd2eca0c2603d84f7afbe73b6ad22c10e14b AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.11.0-bullseye-slim@sha256:21fe81f52728a8fdcb1220be67a0dd2eca0c2603d84f7afbe73b6ad22c10e14b AS runtime
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
