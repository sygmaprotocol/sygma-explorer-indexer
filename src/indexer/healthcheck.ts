import { PrismaClient } from "@prisma/client"
import fastifyHealthcheck from "fastify-healthcheck"
import { fastify } from "fastify"

// Create an instance of the Prisma client
const prisma = new PrismaClient()
export const healthcheckRoute = function healthcheckRoute(): void {
  const app = fastify()

  const PORT: number = Number(process.env.PORT!) || 3000
  void app.register(fastifyHealthcheck, {
    healthcheckUrl: "/health",
    exposeUptime: true,
    underPressureOptions: {
      healthCheckInterval: 5000,
      // eslint-disable-next-line @typescript-eslint/require-await
      healthCheck: async () => {
        try {
          await prisma.$connect()
          return true
        } catch (err) {
          return false
        }
      },
    },
  })

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`⚡️[server]: Server is running at ${address}`)
  })
}
