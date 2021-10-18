import { NextFunction, Request, Response, Router } from "express"

import TransfersService from "../services/transfers.service"

import { jsonStringifyWithBigInt } from "../utils/helpers"

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
      const before = req.query.before?.toString()
      const first = req.query.first ? parseInt(req.query.first?.toString()) : undefined
      const after = req.query.after?.toString()
      const last = req.query.last ? parseInt(req.query.last?.toString()) : undefined
      const transfers = await transfersService.findTransfersByCursor({ before, after, first, last })

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
