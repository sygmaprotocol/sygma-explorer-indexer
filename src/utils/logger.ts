/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import winston from "winston"
import Transports from "winston-transport"

const transportsConfig: Transports[] = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.align()),
  }),
]

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: winston.format.json({}),
  defaultMeta: {
    labels: {
      module: "explorer-indexer",
      version: process.env.VERSION,
    },
  },
  transports: transportsConfig,
})
