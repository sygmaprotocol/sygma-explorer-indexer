# Sygma Explorer Indexer

## Table of Contents

- [Preparations](#preparations)
- [Install](#install)
- [Usage](#usage)
<!-- - [License](#license) -->

### Stack

- NodeJS + [Typescript](https://github.com/microsoft/TypeScript)

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
COINMARKETCAP_API_KEY=""
COINMARKETCAP_API_URL=""
 ```

### Running locally

```bash
docker compose up
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






