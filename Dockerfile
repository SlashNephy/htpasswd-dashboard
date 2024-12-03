FROM --platform=$BUILDPLATFORM node:22.11.0-bullseye-slim@sha256:afd1dbb68a39182739b3e018c0dbaac9fd84816311775b4e638fa8ecfe388523 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.11.0-bullseye-slim@sha256:afd1dbb68a39182739b3e018c0dbaac9fd84816311775b4e638fa8ecfe388523 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.11.0-bullseye-slim@sha256:afd1dbb68a39182739b3e018c0dbaac9fd84816311775b4e638fa8ecfe388523 AS runtime
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
