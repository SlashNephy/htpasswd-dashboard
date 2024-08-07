FROM --platform=$BUILDPLATFORM node:20.16.0-bullseye-slim@sha256:b55f99f53cc2f1f3c676ac4345a9c4962097887bd2082ee60ceaef5715b9c847 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.16.0-bullseye-slim@sha256:b55f99f53cc2f1f3c676ac4345a9c4962097887bd2082ee60ceaef5715b9c847 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.16.0-bullseye-slim@sha256:b55f99f53cc2f1f3c676ac4345a9c4962097887bd2082ee60ceaef5715b9c847 AS runtime
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
