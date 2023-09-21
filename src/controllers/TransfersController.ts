import { FastifyReply, FastifyRequest } from "fastify"
import {
  ITransfer,
  ITransferByDomain,
  ITransferByDomainQuery,
  ITransferById,
  ITransferByResource,
  ITransferByResourceBetweenDomains,
  ITransferBySender,
  ITransferBySourceDomainToDestinationDomain,
  ITransferByTxHash,
} from "../Interfaces"
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

      const transfersResult = await transfersService.findAllTransfers(status, {
        page,
        limit,
      })

      void reply.status(200).send(transfersResult)
    } catch (e) {
      logger.error(e)
      void reply.status(500)
    }
  },
  transferById: async function (request: FastifyRequest<{ Params: ITransferById }>, reply: FastifyReply): Promise<void> {
    const {
      params: { id },
    } = request

    try {
      const transfer = await transfersService.findTransferById(id)

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
      const transfer = await transfersService.findTransferByTxHash(txHash)
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

  transfersBySender: async function (
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
      const transfers = await transfersService.findTransfersByAccountAddress(senderAddress, status, { page, limit })

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      void reply.status(500)
    }
  },

  transfersByResource: async function (
    request: FastifyRequest<{ Params: ITransferByResource; Querystring: ITransfer }>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { resourceID },
    } = request
    const {
      query: { page, limit, status },
    } = request

    try {
      const transfers = await transfersService.findTransfersByResourceID(resourceID, status, { page, limit })

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      logger.error("Error occurred when fetching transfers by resource.")
      void reply.status(500)
    }
  },

  transfersBySourceDomainToDestinationDomain: async function (
    request: FastifyRequest<{ Params: ITransferBySourceDomainToDestinationDomain; Querystring: ITransfer }>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { sourceDomainID, destinationDomainID },
    } = request
    const {
      query: { page, limit },
    } = request

    try {
      const transfers = await transfersService.findTransfersBySourceDomainToDestinationDomain(sourceDomainID, destinationDomainID, { page, limit })

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      logger.error("Error occurred when fetching transfers by source and destination domain.")
      void reply.status(500)
    }
  },

  transfersByResourceBetweenDomains: async function (
    request: FastifyRequest<{ Params: ITransferByResourceBetweenDomains; Querystring: ITransfer }>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { resourceID, sourceDomainID, destinationDomainID },
    } = request
    const {
      query: { page, limit },
    } = request

    try {
      const transfers = await transfersService.findTransfersByResourceBetweenDomains(resourceID, sourceDomainID, destinationDomainID, { page, limit })

      void reply.status(200).send(transfers)
    } catch (e) {
      logger.error(e)
      logger.error("Error occurred when fetching transfers by resource, source domain and destination domain.")
      void reply.status(500)
    }
  },

  transfersByDomain: async function (
    request: FastifyRequest<{ Params: ITransferByDomain; Querystring: ITransferByDomainQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      params: { domainID },
    } = request

    const {
      query: { page, limit, status, domain },
    } = request

    try {
      const transfers = await transfersService.findTransfersByDomain(domainID, domain, status, { page, limit })

      void reply.status(200).send(transfers)
    } catch (e) {
      if (e instanceof NotFound) {
        void reply.status(404)
      } else {
        logger.error(e)
        logger.error("Error occurred when fetching transfers by domain")
        void reply.status(500)
      }
    }
  },
}
