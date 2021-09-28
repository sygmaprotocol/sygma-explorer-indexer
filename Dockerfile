FROM node:14.17-alpine AS builder

# update packages
RUN apk update

# create root application folder
WORKDIR /app

# copy configs to /app folder
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

# RUN npm install pm2 -g

RUN yarn build

FROM node:14.17-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ecosystem.prod.config.js ./
COPY --from=builder /app/build ./build

EXPOSE 8001

CMD [ "yarn", "deploy:prod"]