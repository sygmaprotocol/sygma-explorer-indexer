import { FastifyReply, FastifyRequest } from "fastify"
import { IRouteByResourceType, IRoutesByDomain } from "../interfaces"
import { logger } from "../utils/logger"
import { RoutesService } from "../services/routes.service"

const routeService = new RoutesService(process.env.ENV || "testnet")

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

      void reply.status(200).send(routes)
    } catch (e) {
      logger.error("Error occurred when fetching routes.", e)
      void reply.status(500)
    }
  },
}
