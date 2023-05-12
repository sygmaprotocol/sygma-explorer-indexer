import { FastifyReply, FastifyRequest } from "fastify"
import { ITransfer, ITransferById } from "Interfaces"

import TransfersService from "../services/transfers.service"

const transfersService = new TransfersService()

export const TransfersController = {
  transfers: async function(request: FastifyRequest<{ Querystring: ITransfer }>, reply: FastifyReply) {
    try {
      const { query: { page, limit, status } } = request

      const transfersResult = await transfersService.findAllTransfes({
        page,
        limit,
        status
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
