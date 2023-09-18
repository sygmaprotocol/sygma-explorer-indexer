import { FastifyReply, FastifyRequest } from "fastify"
import { ITransfer, ITransferByDomain, ITransferByDomainQuery, ITransferById, ITransferByResource, ITransferByResourceBetweenDomains, ITransferBySender, ITransferBySourceDomainToDestinationDomain, ITransferByTxHash } from "../Interfaces"
import { logger } from "../utils/logger"

import TransfersService from "../services/transfers.service"
import { NotFound } from "../utils/helpers"

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
      void reply.status(500)
    }
  },
  transferById: async function (request: FastifyRequest<{ Params: ITransferById }>, reply: FastifyReply): Promise<void> {
    const { id } = request.params

    try {
      const transfer = await transfersService.findTransferById({ id })

      void reply.status(200).send(transfer)
    } catch (e) {
      if (e instanceof NotFound) {
        void reply.status(404)
      } else {
        logger.error(e)
        void reply.status(500)
      }
    }
  },

  transferByTxHash: async function (request: FastifyRequest<{ Params: ITransferByTxHash }>, reply: FastifyReply): Promise<void> {
    const { txHash } = request.params

    try {
      const transfer = await transfersService.findTransferByTxHash({ txHash })
      void reply.status(200).send(transfer)
    } catch (e) {
      if (e instanceof NotFound) {
        void reply.status(404)
      } else {
        logger.error(e)
        void reply.status(500)
      }
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
      const transfers = await transfersService.findTransferByFilterParams({ page, limit, status, sender: senderAddress })

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      void reply.status(500)
    }
  },

  transferByResource: async function (
    request: FastifyRequest<{ Params: ITransferByResource; Querystring: ITransfer}>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { resourceID },
    } = request
    const {
      query: { page, limit, status },
    } = request

    try {
      const transfers = await transfersService.findTransferByResourceID({ page, limit, status, resourceID: resourceID })

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      void reply.status(500)
    }
  },

  transferBySourceDomainToDestinationDomain: async function (
    request: FastifyRequest<{ Params: ITransferBySourceDomainToDestinationDomain; Querystring: ITransfer}>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { sourceDomainID, destinationDomainID },
    } = request
    const {
      query: { page, limit },
    } = request

    try {
      const transfers = await transfersService.findTransferBySourceDomainToDestinationDomain({ page, limit, sourceDomainId: sourceDomainID, destinationDomainID: destinationDomainID})

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      void reply.status(500)
    }
  },

  transferByResourceBetweenDomains: async function (
    request: FastifyRequest<{ Params: ITransferByResourceBetweenDomains; Querystring: ITransfer}>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { resourceID, sourceDomainID, destinationDomainID },
    } = request
    const {
      query: { page, limit },
    } = request

    try {
      const transfers = await transfersService.findTransferByResourceBetweenDomains({ page, limit, resourceID: resourceID, sourceDomainId: sourceDomainID, destinationDomainID: destinationDomainID})

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      void reply.status(500)
    }
  },

  transferByDomain: async function (
    request: FastifyRequest<{ Params: ITransferByDomain; Querystring: ITransferByDomainQuery}>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { domainID},
    } = request
    const {
      query: { page, limit, status, domain},
    } = request

    try {
      const transfers = await transfersService.findTransferByDomain({ page, limit, status, domain, domainID: domainID})

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      void reply.status(500)
    }
  },
}
