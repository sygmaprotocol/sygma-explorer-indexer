import { FastifyInstance } from "fastify"
import { TransfersController } from "./controllers/TransfersController"

export async function routes(fastify: FastifyInstance) {

  fastify.route({
    method: 'GET',
    url: '/transfers',
    handler: TransfersController.transfers
  })

  fastify.route({
    method: 'GET',
    url: '/transfers/:id',
    handler: TransfersController.transferById
  })
}