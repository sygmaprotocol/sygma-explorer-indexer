import { FastifyInstance } from "fastify"
import { TransfersController } from "./controllers/TransfersController"

// eslint-disable-next-line @typescript-eslint/require-await
export async function routes(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: "GET",
    url: "/transfers",
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
    handler: TransfersController.transferBySender,
  })

  fastify.route({
    method: "GET",
    url: "/resources/:resourceID/transfers",
    handler: TransfersController.transferByResource,
  })

  fastify.route({
    method: "GET",
    url: "/domains/source/:sourceDomainID/destination/:destinationDomainID/transfers",
    handler: TransfersController.transferBySourceDomainToDestinationDomain,
  })

  fastify.route({
    method: "GET",
    url: "/resources/:resourceID/domains/:sourceDomainID/destination/:destinationDomainID/transfers",
    handler: TransfersController.transferByResourceBetweenDomains,
  })
}
