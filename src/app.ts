import express, { Application } from "express"
import morgan from "morgan"
import { routes } from "./routes"
import { stream } from "./utils/logger"

export const app: Application = express()
app.use(morgan("dev", { stream }))
app.use(express.json())

routes(app)
