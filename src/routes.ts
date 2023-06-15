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
    url: "/sender/:senderAddress/transfers",
    handler: TransfersController.transferBySender,
  })

  fastify.route({
    method: 'GET',
    url: '/transfers/:id',
    handler: TransfersController.transferById
  })
}