FROM --platform=$BUILDPLATFORM node:20.16.0-bullseye-slim@sha256:397f0d20122a26a57ac8f934079a3dfa4fce986e8938a208bc674cda3a2ac674 AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:20.16.0-bullseye-slim@sha256:397f0d20122a26a57ac8f934079a3dfa4fce986e8938a208bc674cda3a2ac674 AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:20.16.0-bullseye-slim@sha256:397f0d20122a26a57ac8f934079a3dfa4fce986e8938a208bc674cda3a2ac674 AS runtime
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
