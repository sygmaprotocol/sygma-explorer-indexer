import { FastifyInstance } from "fastify"
import { TransfersController } from "./controllers/TransfersController"
import {
  paginationSchema,
  domainSchema,
  resourceBetweenDomainsSchema,
  sourceAndDestinationDomainSchema,
  resourceSchema,
  senderSchema,
} from "./controllers/schemas"

// eslint-disable-next-line @typescript-eslint/require-await
export async function routes(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: "GET",
    url: "/transfers",
    schema: paginationSchema,
    handler: TransfersController.transfers,
  })

  fastify.route({
    method: "GET",
    url: "/transfers/:id",
    handler: TransfersController.transferById,
  })

  fastify.route({
    method: "GET",
    url: "/transfers/txHash/:txHash",
    handler: TransfersController.transferByTxHash,
  })

  fastify.route({
    method: "GET",
    url: "/sender/:senderAddress/transfers",
    schema: senderSchema,
    handler: TransfersController.transfersBySender,
  })

  fastify.route({
    method: "GET",
    url: "/resources/:resourceID/transfers",
    schema: resourceSchema,
    handler: TransfersController.transfersByResource,
  })

  fastify.route({
    method: "GET",
    url: "/domains/source/:sourceDomainID/destination/:destinationDomainID/transfers",
    schema: sourceAndDestinationDomainSchema,
    handler: TransfersController.transfersBySourceDomainToDestinationDomain,
  })

  fastify.route({
    method: "GET",
    url: "/resources/:resourceID/domains/source/:sourceDomainID/destination/:destinationDomainID/transfers",
    schema: resourceBetweenDomainsSchema,
    handler: TransfersController.transfersByResourceBetweenDomains,
  })

  fastify.route({
    method: "GET",
    url: "/domains/:domainID/transfers",
    schema: domainSchema,
    handler: TransfersController.transfersByDomain,
  })
}
