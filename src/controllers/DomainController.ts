/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { FastifyReply, FastifyRequest } from "fastify"
import { Environment } from "@buildwithsygma/core"
import { ResourcesMetadataConfig } from "../utils/resourcesMetadata"
import { logger } from "../utils/logger"
import { DomainMetadataConfig } from "../utils/domainMetadata"

const env = process.env.ENVIRONMENT || ""
const environment = (env.toLowerCase() as Environment) || Environment.MAINNET
export const DomainsController = {
  domainsMetadata: function (request: FastifyRequest<{}>, reply: FastifyReply): void {
    const metadata = DomainMetadataConfig[environment]
    if (metadata) {
      void reply.status(200).send(JSON.stringify(metadata))
    } else {
      logger.error(`Unable to find metadata for environment ${environment}`)
      void reply.status(404)
    }
  },
  resources: function (request: FastifyRequest<{ Params: { domainID: string } }>, reply: FastifyReply): void {
    const {
      params: { domainID },
    } = request
    const resources = ResourcesMetadataConfig[environment]!

    if (!resources) {
      logger.error(`Unable to find resources metadata for ${environment}`)
      void reply.status(404)
    } else {
      void reply.status(200).send(resources[parseInt(domainID)])
    }
  },
}
