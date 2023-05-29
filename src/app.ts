/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
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