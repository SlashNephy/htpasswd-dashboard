FROM --platform=$BUILDPLATFORM node:20.12.2-bullseye-slim@sha256:e009eb4a66bb610b5487d0870c91848f3e87b45baab6309f79a260bfdddb6e06 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.12.2-bullseye-slim@sha256:e009eb4a66bb610b5487d0870c91848f3e87b45baab6309f79a260bfdddb6e06 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.12.2-bullseye-slim@sha256:e009eb4a66bb610b5487d0870c91848f3e87b45baab6309f79a260bfdddb6e06 AS runtime
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
