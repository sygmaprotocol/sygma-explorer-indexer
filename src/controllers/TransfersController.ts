import { NextFunction, Request, Response, Router } from "express"

import TransfersService from "../services/transfers.service"

import { jsonStringifyWithBigInt } from "../utils/helpers"

export const TransfersController: Router = Router()

const transfersService = new TransfersService()

const DEFAULT_PAGE_NUMBER = "1"
const DEFAULT_LIMIT_NUMBER = "10"

TransfersController.get(
  "/",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      console.time("res")
      const page = parseInt(req.query.page?.toString() ?? DEFAULT_PAGE_NUMBER)
      const limit = parseInt(req.query.limit?.toString() ?? DEFAULT_LIMIT_NUMBER)
      const skipIndex = (page - 1) * limit

      const transfers = await transfersService.findAllTransfes({ limit, skipIndex })
      const transferSerialized = jsonStringifyWithBigInt(transfers)

      res.setHeader("Content-Type", "application/json")
      res.status(200).send(transferSerialized)

      console.timeEnd("res")
    } catch (e) {
      next(e)
    }
  }
)
