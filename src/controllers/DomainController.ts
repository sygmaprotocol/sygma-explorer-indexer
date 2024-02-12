import { FastifyReply, FastifyRequest } from "fastify"
import { Environment } from "@buildwithsygma/sygma-sdk-core"
import { logger } from "../utils/logger"
import { DomainMetadataConfig } from "../utils/domainMetadata"

const env = (process.env.ENV as Environment) || Environment.TESTNET
export const DomainsController = {
  domains: function (request: FastifyRequest<{}>, reply: FastifyReply): void {
    const metadata = DomainMetadataConfig[env]
    if (metadata) {
      void reply.status(200).send(metadata)
    } else {
      logger.error("Unable to find metadata for .")
      void reply.status(500)
    }
  },
}
