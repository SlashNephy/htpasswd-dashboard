FROM --platform=$BUILDPLATFORM node:22.18.0-bullseye-slim@sha256:6a1fddcac8be3a4fb41fdce952468a5aad23f80d1969eb6be5df87f72d7bc114 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.18.0-bullseye-slim@sha256:6a1fddcac8be3a4fb41fdce952468a5aad23f80d1969eb6be5df87f72d7bc114 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.18.0-bullseye-slim@sha256:6a1fddcac8be3a4fb41fdce952468a5aad23f80d1969eb6be5df87f72d7bc114 AS runtime
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
