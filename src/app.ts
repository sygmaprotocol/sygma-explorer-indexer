/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import fastify, { FastifyInstance } from "fastify"
import cors from "@fastify/cors"
import fastifyHealthcheck from "fastify-healthcheck"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { routes } from "./routes"

export const app: FastifyInstance = fastify({ logger: true })
void app.register(cors, {
  origin: "*", // in the meantime
})

void app.register(fastifyHealthcheck, {
  healthcheckUrl: "/health",
  exposeUptime: true,
  underPressureOptions: {
    healthCheckInterval: 5000,
    // eslint-disable-next-line @typescript-eslint/require-await
    healthCheck: async () => {
      return true
    },
  },
})

void app.register(fastifySwagger, {
  mode: "dynamic",
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Transfers API",
      version: "1.0.0",
      description: "API documentation for Transfers API",
    },
    servers: [
      {
        url: "http://localhost:8000/",
        description: "Local server",
      },
    ],
  },
})

void app.register(fastifySwaggerUi, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "list",
  },
  staticCSP: true,
})

void app.register(routes, { prefix: "/api" })
