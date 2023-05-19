import { FastifyReply, FastifyRequest } from "fastify"
import { ITransfer, ITransferById, ITransferBySender } from "Interfaces"
import { logger } from "../utils/logger"

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
      logger.error(e)
      void reply.status(400).send(e)
    }
  },
  transferById: async function (request: FastifyRequest<{ Params: ITransferById }>, reply: FastifyReply): Promise<void> {
    const { id } = request.params

    try {
      const transfer = await transfersService.findTransferById({ id })
      void reply.status(200).send(transfer)
    } catch (e) {
      logger.error(e)
      void reply.status(404)
    }
  },
  transferBySender: async function (
    request: FastifyRequest<{ Params: ITransferBySender; Querystring: ITransfer }>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { senderAddress },
    } = request
    const {
      query: { page, limit, status },
    } = request

    try {
      const transfer = await transfersService.findTransferByFilterParams({ page, limit, status, sender: senderAddress })

      if (transfer.length !== 0) void reply.status(200).send(transfer)
      void reply.status(404)
    } catch (e) {
      logger.error(e)
      void reply.status(400)
    }
  },
}
