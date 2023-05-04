import { FastifyInstance } from "fastify"
import { TransfersController } from "./controllers/TransfersController"
import { IndexController } from "./controllers/IndexController"

export async function routes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: IndexController
  })

  fastify.route({
    method: 'GET',
    url: '/transfers',
    handler: TransfersController.transfers
  })

  fastify.route({
    method: 'GET',
    url: '/transfers/offset',
    handler: TransfersController.transferOffset
  })

  fastify.route({
    method: 'GET',
    url: '/transfers/:id',
    handler: TransfersController.transferById
  })

  fastify.route({
    method: 'GET',
    url: '/transfers/byTransactionHash/:transactionHash',
    handler: TransfersController.transferByTransactionHash
  })
}