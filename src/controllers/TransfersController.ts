import { FastifyReply, FastifyRequest } from "fastify"
import { Transfer } from "@prisma/client"
import { ITransfer, ITransferById, ITransferBySender } from "Interfaces"

import TransfersService, { TransfersByCursorOptions } from "../services/transfers.service"

const transfersService = new TransfersService()

export const TransfersController = {
  transfers: async function(request: FastifyRequest<{ Querystring: ITransfer }>, reply: FastifyReply) {
    try {
      const { query: { page, limit, status } } = request

      const transfersResult = await transfersService.findTransfersByCursor({
        page,
        limit,
        status
      }) as Transfer[];

      reply.status(200).send(transfersResult)
    } catch (e) {
      reply.status(400).send(e)
    }
  },
  transferById: async function(request: FastifyRequest<{ Params: ITransferById }>, reply: FastifyReply) {
      const { id } = request.params

      try {
        const transfer = await transfersService.findTransferById({ id }) as Transfer;
        reply.status(200).send(transfer)
      } catch(e) {
        reply.status(404)
      }
    },
    transferBySender: async function(request: FastifyRequest<{ Params: ITransferBySender }>, reply: FastifyReply) {
      const { sender } = request.params

      try {
        const transfer = await transfersService.findTransfer({ sender })
        reply.status(200).send(transfer)
      } catch(e) {
        reply.status(404)
      }
    }
}
