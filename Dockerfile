FROM --platform=$BUILDPLATFORM node:24.11.1-bullseye-slim@sha256:06dcbf086e70cc62e746f4a3e7617a5bc14e6e2f78cb86ad9e4baaf5aee4fa74 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:24.11.1-bullseye-slim@sha256:06dcbf086e70cc62e746f4a3e7617a5bc14e6e2f78cb86ad9e4baaf5aee4fa74 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:24.11.1-bullseye-slim@sha256:06dcbf086e70cc62e746f4a3e7617a5bc14e6e2f78cb86ad9e4baaf5aee4fa74 AS runtime
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
