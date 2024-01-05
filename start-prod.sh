#!/bin/bash

npx prisma db push
node ./build/indexer/index.js