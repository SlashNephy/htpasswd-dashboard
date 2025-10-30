FROM --platform=$BUILDPLATFORM node:22.21.1-bullseye-slim@sha256:f6d3331d7454b8dd0afd4d027ef09ba0f5dd3ab94e15bc496c4f40cfca5bae32 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.21.1-bullseye-slim@sha256:f6d3331d7454b8dd0afd4d027ef09ba0f5dd3ab94e15bc496c4f40cfca5bae32 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.21.1-bullseye-slim@sha256:f6d3331d7454b8dd0afd4d027ef09ba0f5dd3ab94e15bc496c4f40cfca5bae32 AS runtime
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
