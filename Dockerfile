FROM --platform=$BUILDPLATFORM node:22.17.1-bullseye-slim@sha256:741a60f76e79ab4080ebb10d24ec0c2aa4527fc44e33a8d609c416cc351b4fff AS cache
WORKDIR /app

COPY ./.yarn/ ./.yarn/
COPY ./package.json ./.yarnrc.yml ./yarn.lock ./
RUN yarn --immutable

FROM --platform=$BUILDPLATFORM node:22.17.1-bullseye-slim@sha256:741a60f76e79ab4080ebb10d24ec0c2aa4527fc44e33a8d609c416cc351b4fff AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=cache /app/node_modules/ ./node_modules/
COPY ./ ./
RUN yarn build

FROM --platform=$TARGETPLATFORM node:22.17.1-bullseye-slim@sha256:741a60f76e79ab4080ebb10d24ec0c2aa4527fc44e33a8d609c416cc351b4fff AS runtime
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
