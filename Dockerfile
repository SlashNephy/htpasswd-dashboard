FROM --platform=$BUILDPLATFORM node:20.12.2-bullseye-slim@sha256:f8c4cf58c27830c78d6e2b351e55cad65f5e388b892e76eac068a64bf6ba1caf AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.12.2-bullseye-slim@sha256:f8c4cf58c27830c78d6e2b351e55cad65f5e388b892e76eac068a64bf6ba1caf AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.12.2-bullseye-slim@sha256:f8c4cf58c27830c78d6e2b351e55cad65f5e388b892e76eac068a64bf6ba1caf AS runtime
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
