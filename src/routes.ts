import { Application, Router } from "express"
import { TransfersController } from "./controllers/TransfersController"
import { IndexController } from "./controllers/IndexController"

const _routes: [string, Router][] = [
  ["/", IndexController],
  ["/transfers", TransfersController],
]

export const routes = (app: Application) => {
  _routes.forEach((route) => {
    const [url, controller] = route
    app.use(url, controller)
  })
}
