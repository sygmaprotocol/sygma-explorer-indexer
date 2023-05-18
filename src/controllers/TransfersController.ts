import { FastifyReply, FastifyRequest } from "fastify"
import { ITransfer, ITransferById } from "Interfaces"

import TransfersService from "../services/transfers.service"

const transfersService = new TransfersService()

export const TransfersController = {
  transfers: async function (request: FastifyRequest<{ Querystring: ITransfer }>, reply: FastifyReply): Promise<void> {
    try {
      const {
        query: { page, limit, status },
      } = request

      const transfersResult = await transfersService.findTransfersByCursor({
        page,
        limit,
        status,
      })

      void reply.status(200).send(transfersResult)
    } catch (e) {
      void reply.status(400).send(e)
    }
  },
  transferById: async function (request: FastifyRequest<{ Params: ITransferById }>, reply: FastifyReply) {
    const { id } = request.params

    try {
      const transfer = await transfersService.findTransfer({ id })
      void reply.status(200).send(transfer)
    } catch (e) {
      void reply.status(404)
    }
  },
}
