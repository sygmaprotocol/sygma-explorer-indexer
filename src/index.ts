import { app } from "./app"

const PORT: number = Number(process.env.PORT!) || 8000;

app.listen({ port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`⚡️[server]: Server is running at ${address}`)
});
