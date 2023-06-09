# Sygma Explorer Indexer

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
<!-- - [License](#license) -->

## Features

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

```bash
DATABASE_URL=''
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



