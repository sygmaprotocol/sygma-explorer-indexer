# Sygma Explorer Indexer

## Table of Contents

- [Preparations](#preparations)
- [Install](#install)
- [Usage](#usage)
<!-- - [License](#license) -->

### Stack

- NodeJS + [Typescript](https://github.com/microsoft/TypeScript)

## Preparations
Add The following in your `/etc/hosts` file:
````
127.0.0.1       mongo1
127.0.0.1       mongo2
127.0.0.1       mongo3
````

This is required to run the mongo replicas locally and have access to them.

## Install

```
yarn install
```

## Usage

### Stub server
You can run stub server that will follow swagger API definition inside `swagger.yml` by:

`yarn start:stub`

Stub server will be exposed on `localhost:8080`. This will also expose Swagger documentation on `localhost:80/swagger`.

### Env definition

This are the env variables that are required:

```bash
DATABASE_URL="mongodb://<HOST>:<PORT>/<DATABASE_NAME>?replicaSet=<REPLICA_NAME>&authSource=admin&retryWrites=true&w=majority"
STAGE=""
CHAIN_ANALYSIS_API_KEY=""
CHAIN_ANALYSIS_URL=""
ENVIRONMENT="" # testnet || devnet
RPC_URL_CONFIG="[ { "id": DOMAIN_ID, "endpoint": DOMAIN_ENDPOINT } ]"
 ```

### Running locally

```bash
docker compose -f ./docker-compose.only-mongo.yml up

npx prisma generate

yarn index:fetch

yarn start:dev
```

### Build

For production build use the command:

```
yarn build
```

### Testing

For testing use the command:

````
yarn test
````






