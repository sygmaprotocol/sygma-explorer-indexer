import winston from "winston"
import Transports from "winston-transport"

const format = winston.format.printf(({ level, message, labels, timestamp, requestId }) => {
  message = winston.format.colorize({ all: false, message: true }).colorize(level, message as string)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  let log: string = `${timestamp as string} [${labels.module as string}] ${level.toUpperCase()}: ${message as string}`
  if (requestId) {
    log += `RequestId: ${requestId as string}`
  }
  return log
})

const transportsConfig: Transports[] = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.align(), format),
  }),
]

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: winston.format.json({}),
  defaultMeta: {
    labels: {
      module: "explorer-indexer",
    },
  },
  transports: transportsConfig,
})
