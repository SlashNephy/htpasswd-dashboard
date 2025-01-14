FROM --platform=$BUILDPLATFORM node:22.13.0-bullseye-slim@sha256:325ce775e38a3960fb5492eed4fc60bd86d48ec026e62ce73828081738de8e6b AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.13.0-bullseye-slim@sha256:325ce775e38a3960fb5492eed4fc60bd86d48ec026e62ce73828081738de8e6b AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.13.0-bullseye-slim@sha256:325ce775e38a3960fb5492eed4fc60bd86d48ec026e62ce73828081738de8e6b AS runtime
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
