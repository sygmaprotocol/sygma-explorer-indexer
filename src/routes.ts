/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
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