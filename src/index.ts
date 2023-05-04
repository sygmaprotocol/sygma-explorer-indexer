import errorMiddleware from "./middlewares/error.middleware"
import { app } from "./app"

const PORT: number = Number(process.env.PORT!) || 8000;
const HOST = process.env.HOST || 'localhost';
const portToUse = { port: PORT as string | number };

app.listen({ port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`⚡️[server]: Server is running at ${address}`)
});
