import { NextFunction, Request, Response, Router } from "express"

import TransfersService from "../services/transfers.service"

import { jsonStringifyWithBigInt } from "../utils/helpers"

export const TransfersController: Router = Router()

const transfersService = new TransfersService()

TransfersController.get(
  "/",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      console.time("res")
      const transfers = await transfersService.findAllTransfes()
      const transferSerialized = jsonStringifyWithBigInt(transfers)

      res.setHeader("Content-Type", "application/json")
      res.status(200).send(transferSerialized)

      console.timeEnd("res")
    } catch (e) {
      next(e)
    }
  }
)
