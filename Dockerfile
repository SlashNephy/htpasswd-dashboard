FROM --platform=$BUILDPLATFORM node:22.19.0-bullseye-slim@sha256:8efd3ed25d83b4328df873ed9853a5bd97ffce8eb3498785e45c3e7297571f0e AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.19.0-bullseye-slim@sha256:8efd3ed25d83b4328df873ed9853a5bd97ffce8eb3498785e45c3e7297571f0e AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.19.0-bullseye-slim@sha256:8efd3ed25d83b4328df873ed9853a5bd97ffce8eb3498785e45c3e7297571f0e AS runtime
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
