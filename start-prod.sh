#!/bin/bash

npx npx prisma db push
node ./build/indexer/index.js