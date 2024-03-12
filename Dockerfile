FROM --platform=$BUILDPLATFORM node:20.11.1-bullseye-slim@sha256:5a5a92b3a8d392691c983719dbdc65d9f30085d6dcd65376e7a32e6fe9bf4cbe AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.11.1-bullseye-slim@sha256:5a5a92b3a8d392691c983719dbdc65d9f30085d6dcd65376e7a32e6fe9bf4cbe AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.11.1-bullseye-slim@sha256:5a5a92b3a8d392691c983719dbdc65d9f30085d6dcd65376e7a32e6fe9bf4cbe AS runtime
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
