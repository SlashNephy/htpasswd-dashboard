FROM --platform=$BUILDPLATFORM node:24.12.0-bullseye-slim@sha256:99c26b45ed43541718e38d5778792f38c0f3655dd0e1415f24c61782a62b0a1a AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:24.12.0-bullseye-slim@sha256:99c26b45ed43541718e38d5778792f38c0f3655dd0e1415f24c61782a62b0a1a AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:24.12.0-bullseye-slim@sha256:99c26b45ed43541718e38d5778792f38c0f3655dd0e1415f24c61782a62b0a1a AS runtime
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
