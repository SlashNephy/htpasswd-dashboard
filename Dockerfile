FROM --platform=$BUILDPLATFORM node:22.14.0-bullseye-slim@sha256:7ed5bbd6c552d2a8f83c24620c68e88f4299980214d89bc1f39c46bfa80b1ec7 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.14.0-bullseye-slim@sha256:7ed5bbd6c552d2a8f83c24620c68e88f4299980214d89bc1f39c46bfa80b1ec7 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.14.0-bullseye-slim@sha256:7ed5bbd6c552d2a8f83c24620c68e88f4299980214d89bc1f39c46bfa80b1ec7 AS runtime
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
