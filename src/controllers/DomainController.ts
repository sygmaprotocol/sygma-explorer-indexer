/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { FastifyReply, FastifyRequest } from "fastify"
import { Environment } from "@buildwithsygma/sygma-sdk-core"
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
      void reply.status(500)
    }
  },
  resources: function (request: FastifyRequest<{ Params: { domainID: string } }>, reply: FastifyReply): void {
    const {
      params: { domainID },
    } = request
    const domains = DomainMetadataConfig[environment]
    if (!domains) {
      logger.error(`Unable to find metadata for environment ${environment}`)
      void reply.status(500)
    } else {
      const domainById = domains[Number(domainID)]
      const resources = domainById?.resources
      void reply.status(200).send(resources)
    }
  },
}
