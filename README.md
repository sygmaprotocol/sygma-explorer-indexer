# Chainbridge Explorer Indexer

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

### Development

For running a local instance use the command:

```
yarn start
```

You can use `GET` on `/transfers` to get the transfers data

````
curl http://localhost:8000/transfers
````


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



