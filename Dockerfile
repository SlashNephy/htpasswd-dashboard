FROM --platform=$BUILDPLATFORM node:20.5.1-bullseye-slim@sha256:6a0c42361d113961655d13f4e5accd26cf2424b9652272a73ab25098718e25be AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.5.1-bullseye-slim@sha256:6a0c42361d113961655d13f4e5accd26cf2424b9652272a73ab25098718e25be AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.5.1-bullseye-slim@sha256:6a0c42361d113961655d13f4e5accd26cf2424b9652272a73ab25098718e25be AS runtime
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
