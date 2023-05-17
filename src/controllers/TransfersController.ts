import { FastifyReply, FastifyRequest } from "fastify"
import { Transfer } from "@prisma/client"
import { ITransfer, ITransferById, ITransferBySender } from "Interfaces"

import TransfersService from "../services/transfers.service"

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
    transferBySender: async function(request: FastifyRequest<{ Params: ITransferBySender, Querystring: ITransfer }>, reply: FastifyReply) {
      const { params: { senderAddress } } = request
      const { query: { page, limit, status } } = request;

      try {
        const transfer = await transfersService.findTransferByFilterParams({page, limit, status, sender: senderAddress })

        if(transfer.length !== 0) reply.status(200).send(transfer)
        reply.status(404)
      } catch(e) {
        reply.status(400)
      }
    }
}
