import fastify, { FastifyInstance } from "fastify"
import cors from "@fastify/cors"
import fastifyHealthcheck from "fastify-healthcheck"
import { routes } from "./routes"

export const app: FastifyInstance = fastify({ logger: true })
app.register(cors, {
  origin: "*" // in the meantime
});

app.register(fastifyHealthcheck, {
  healthcheckUrl: "/health",
  exposeUptime: true,
  underPressureOptions: {
    healthCheckInterval: 5000,
    healthCheck: async () => {
      return true
    }
  }
});

app.register(routes, { prefix: "/api" });