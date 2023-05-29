/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { FastifyReply, FastifyRequest } from "fastify"
import { ITransfer, ITransferById } from "Interfaces"

import TransfersService from "../services/transfers.service"

import { getPaginationParams } from "../utils/helpers"

const transfersService = new TransfersService()

export const TransfersController = {
  transfers: async function(request: FastifyRequest<{ Querystring: ITransfer }>, reply: FastifyReply) {
    try {
      const { query: { before, first, after, last } } = request
      const params = getPaginationParams({ before, first, after, last })

      const transfersResult = await transfersService.findTransfersByCursor({
        ...params
      })

      reply.status(200).send(transfersResult)
    } catch (e) {
      reply.status(400).send(e)
    }
  },
  transferById: async function(request: FastifyRequest<{ Params: ITransferById }>, reply: FastifyReply) {
      const { id } = request.params

      try {
        const transfer = await transfersService.findTransfer({ id })
        reply.status(200).send(transfer)
      } catch(e) {
        reply.status(404)
      }
    }
}
