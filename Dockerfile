FROM --platform=$BUILDPLATFORM node:20.18.0-bullseye-slim@sha256:b81b74a27d9a774a0acaac769e0ef67ee8e6238f6df3301147062d1b1598403a AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.18.0-bullseye-slim@sha256:b81b74a27d9a774a0acaac769e0ef67ee8e6238f6df3301147062d1b1598403a AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.18.0-bullseye-slim@sha256:b81b74a27d9a774a0acaac769e0ef67ee8e6238f6df3301147062d1b1598403a AS runtime
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
