import { FastifyReply, FastifyRequest } from "fastify"
import { ITransfer, ITransferById, ITransferByTransactionHash, ITransferOffSet } from "Interfaces"

import TransfersService from "../services/transfers.service"

import { buildQueryParamsToPasss, jsonStringifyWithBigInt } from "../utils/helpers"

const transfersService = new TransfersService()

const DEFAULT_PAGE_NUMBER = "1"
const DEFAULT_LIMIT_NUMBER = "10"

export const TransfersController = {
  transfers: async function(request: FastifyRequest<{ Querystring: ITransfer }>, reply: FastifyReply) {
    try {
      const { query: { before, first, after, last } } = request
      const params = buildQueryParamsToPasss({ before, first, after, last })

      const transfers = await transfersService.findTransfersByCursor({
        ...params
      })

      reply.header("Content-Type", "application/json")
      reply.status(200).send(transfers)
    } catch (e) {
      reply.status(404).send(e)
    }
  },
  transferOffset: async function(request: FastifyRequest<{ Querystring: ITransferOffSet }>, reply: FastifyReply) {
    try {
      const page = parseInt(request.query.page?.toString() ?? DEFAULT_PAGE_NUMBER)
      const limit = parseInt(request.query.limit?.toString() ?? DEFAULT_LIMIT_NUMBER)
      const skipIndex = (page - 1) * limit

      const transfers = await transfersService.findAllTransfes({ limit, skipIndex })
      const transferSerialized = jsonStringifyWithBigInt(transfers)

      reply.header("Content-Type", "application/json")
      
      reply.status(200).send(transferSerialized)
    } catch (e) {
      reply.status(404).send(e)
    }
  },
  transferFilters: async function(request: FastifyRequest<{ Querystring: ITransfer }>, reply: FastifyReply) {
    try {
      const { query: { before, first, after, last, ...rest } } = request
      const params = buildQueryParamsToPasss({ before, first, after, last, filters: rest })

      const transfers = await transfersService.findTransfersByCursor({
        ...params
      })

      reply.header("Content-Type", "application/json")
      reply.status(200).send(transfers)
    } catch (e) {
      reply.status(404).send(e)
    }
  },
  transferById: async function(request: FastifyRequest<{ Params: ITransferById }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const transfer = await transfersService.findTransfer({ id })
      const transferSerialized = jsonStringifyWithBigInt(transfer)

      reply.header("Content-Type", "application/json")
      reply.status(200).send(transferSerialized)
    } catch (e) {
      reply.status(404).send(e)
    }
  },
  transferByTransactionHash: async function(request: FastifyRequest<{ Params: ITransferByTransactionHash }>, reply: FastifyReply) {
    try {
      const { hash } = request.params
      const transfer = await transfersService.findTransferByTransactionHash({ hash })
      const transferSerialized = jsonStringifyWithBigInt(transfer)

      reply.header("Content-Type", "application/json")
      reply.status(200).send(transferSerialized)
    } catch (e) {
      reply.status(404).send(e)
    }
  }
}
