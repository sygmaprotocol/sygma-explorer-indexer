FROM node:18.16-alpine AS dev

# update packages
RUN apk update

# create root application folder
WORKDIR /app

# Install node dependencies - done in a separate step so Docker can cache it.
COPY yarn.lock .
COPY package.json .
COPY .env.sample .

RUN yarn install --ignore-scripts --non-interactive --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build

FROM node:18.16-alpine

COPY --from=dev /usr/app/dist /app
COPY --from=dev /usr/app/package.json /app/
COPY --from=dev /usr/app/yarn.lock /app/

RUN chown -R node: .

USER node

RUN yarn install --non-interactive --frozen-lockfile --production && yarn cache clean

CMD ["node", "index.js"]