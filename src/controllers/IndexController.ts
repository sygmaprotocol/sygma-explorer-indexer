import { NextFunction, Request, Response, Router } from "express"
export const IndexController: Router = Router()

IndexController.get(
  "/",
  async(req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).send({ data: "Hello!" })
    } catch (e) {
      next(e)
    }
  }
)
