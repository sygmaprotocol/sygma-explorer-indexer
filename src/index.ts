import cors from "cors"
import { app } from "./app"

const PORT = 8000

app.use(
  cors({
    origin: "*",
  })
)

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})
