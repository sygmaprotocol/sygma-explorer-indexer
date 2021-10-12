import errorMiddleware from "./middlewares/error.middleware"
import { app } from "./app"

const PORT = process.env.PORT || 8000

app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})
