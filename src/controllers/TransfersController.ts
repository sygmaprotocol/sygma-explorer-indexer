import { NextFunction, Request, Response, Router } from "express"

import TransfersService from "../services/transfers.service"

import { buildQueryParamsToPasss, jsonStringifyWithBigInt } from "../utils/helpers"

export const TransfersController: Router = Router()

const transfersService = new TransfersService()

const DEFAULT_PAGE_NUMBER = "1"
const DEFAULT_LIMIT_NUMBER = "10"

TransfersController.get(
  "/offset",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page?.toString() ?? DEFAULT_PAGE_NUMBER)
      const limit = parseInt(req.query.limit?.toString() ?? DEFAULT_LIMIT_NUMBER)
      const skipIndex = (page - 1) * limit

      const transfers = await transfersService.findAllTransfes({ limit, skipIndex })
      const transferSerialized = jsonStringifyWithBigInt(transfers)

      res.setHeader("Content-Type", "application/json")
      res.status(200).send(transferSerialized)
    } catch (e) {
      next(e)
    }
  }
)

TransfersController.get(
  "/",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { query: { before, first, after, last } } = req
      const params = buildQueryParamsToPasss({ before, first, after, last })

      const transfers = await transfersService.findTransfersByCursor({
        ...params
      })

      res.setHeader("Content-Type", "application/json")
      res.status(200).send(transfers)
    } catch (e) {
      next(e)
    }
  }
)

TransfersController.get(
  "/filters",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { query: { before, first, after, last, ...rest } } = req
      const params = buildQueryParamsToPasss({ before, first, after, last, filters: rest })

      const transfers = await transfersService.findTransfersByCursor({
        ...params
      })

      res.setHeader("Content-Type", "application/json")
      res.status(200).send(transfers)
    } catch (e) {
      next(e)
    }
  }
)

TransfersController.get(
  "/:id",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const transfer = await transfersService.findTransfer({ id })
      const transferSerialized = jsonStringifyWithBigInt(transfer)

      res.setHeader("Content-Type", "application/json")
      res.status(200).send(transferSerialized)
    } catch (e) {
      next(e)
    }
  }
)

TransfersController.get(
  "/byTransactionHash/:hash",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash } = req.params
      const transfer = await transfersService.findTransferByTransactionHash({ hash })
      const transferSerialized = jsonStringifyWithBigInt(transfer)

      res.setHeader("Content-Type", "application/json")
      res.status(200).send(transferSerialized)
    } catch (e) {
      next(e)
    }
  }
)
