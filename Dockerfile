FROM node:18-alpine AS builder

# update packages
RUN apk update

# create root application folder
WORKDIR /app

RUN corepack enable
RUN corepack prepare yarn@stable --activate
RUN yarn set version stable

# copy configs to /app folder
COPY .yarnrc.yml ./
COPY package*.json ./
COPY tsconfig.json ./
COPY yarn.lock ./
COPY prisma ./prisma/
COPY public ./public

RUN yarn install --frozen-lockfile

# copy source code to /app/src folder
COPY . .

# check files list
RUN ls -a

RUN npm install pm2 -g
RUN yarn prisma:generate

RUN yarn build

FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
LABEL org.opencontainers.image.source https://github.com/sygmaprotocol/sygma-explorer-indexer
EXPOSE 8000

CMD [ "node", "./build/index.js"]