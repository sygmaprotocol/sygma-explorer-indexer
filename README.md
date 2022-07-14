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

### Preparation
Add The following in your `/etc/hosts` file:
````
127.0.0.1       mongo1
127.0.0.1       mongo2
127.0.0.1       mongo3
````

Start mongoDB for development:
```
yarn start:mongo
```

Copy the example config to public directory with command: 
```
yarn copy-config-for-dev
```
Copy example env: 
````
cp .env.example .env
````
Generate prisma assets
````
npx prisma generate
````

Fetch data from blockchain:

````
yarn index:bootstrap
````
### Development
For running a local instance use the command:

```
yarn start:dev
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



