import { NextFunction, Request, Response, Router } from "express";
export const TransfersController: Router = Router();
import { PrismaClient } from "@prisma/client";

import { jsonStringifyWithBigInt} from "../utils/helpers"

const prisma = new PrismaClient();

TransfersController.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.time('res')
      await prisma.$connect();
      const transfers = await prisma.transfer.findMany({
        include: {
          proposals: true,
          votes: true,
        },
      });
      const transferSerialized = jsonStringifyWithBigInt(transfers)

      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(transferSerialized);
      
      await prisma.$disconnect();
      console.timeEnd('res')
    } catch (e) {
      next(e);
    }
  }
);
