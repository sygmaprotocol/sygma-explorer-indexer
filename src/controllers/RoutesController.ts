/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { FastifyReply, FastifyRequest } from "fastify"
import { Environment } from "@buildwithsygma/sygma-sdk-core"
import { IRouteByResourceType, IRoutesByDomain } from "../interfaces"
import { logger } from "../utils/logger"
import { RoutesService } from "../services/routes.service"

const env = process.env.ENVIRONMENT || ""
const routeService = new RoutesService((env.toLowerCase() as Environment) || Environment.MAINNET)

export const RoutesController = {
  routes: function (request: FastifyRequest<{ Params: IRoutesByDomain; Querystring: IRouteByResourceType }>, reply: FastifyReply): void {
    try {
      const {
        params: { domainID },
      } = request

      const {
        query: { resourceType },
      } = request

      const routes = routeService.getAllRoutes(String(domainID), resourceType)

      void reply.status(200).send({ routes: routes })
    } catch (e) {
      logger.error("Error occurred when fetching routes.", e)
      void reply.status(500)
    }
  },
}
