# The Licensed Work is (c) 2023 Sygma
# SPDX-License-Identifier: LGPL-3.0-only
FROM node:18-alpine AS builder

# update packages
RUN apk update

# install git
RUN apk add --no-cache git

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY .yarnrc.yml ./
COPY package*.json ./
COPY tsconfig.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

# copy source code to /app/src folder
COPY . .

# check files list
RUN ls -a

RUN yarn prisma:generate

RUN yarn build

FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
LABEL org.opencontainers.image.source https://github.com/sygmaprotocol/sygma-explorer-indexer
EXPOSE 8000

COPY start-prod.sh /start-prod.sh

ENTRYPOINT ["sh","/start-prod.sh"]
