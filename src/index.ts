/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { app } from "./app"

const PORT: number = Number(process.env.PORT!) || 8000

app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`⚡️[server]: Server is running at ${address}`)
})
