FROM --platform=$BUILDPLATFORM node:24.11.0-bullseye-slim@sha256:b613e20de4ff20e17847cf7d76fa19439a6da9181e1be501b3e9fbb347912ebd AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:24.11.0-bullseye-slim@sha256:b613e20de4ff20e17847cf7d76fa19439a6da9181e1be501b3e9fbb347912ebd AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:24.11.0-bullseye-slim@sha256:b613e20de4ff20e17847cf7d76fa19439a6da9181e1be501b3e9fbb347912ebd AS runtime
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
