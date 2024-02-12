import { routesMainnet } from "../routes/routes.main"
import { routesTestnet } from "../routes/routes.test"
import { Route } from "../routes/types"

export class RoutesService {
  private readonly routes
  constructor(env: string) {
    if (env === "mainnet") {
      this.routes = routesMainnet
    } else {
      this.routes = routesTestnet
    }
  }
  public getAllRoutes(from: string, resourceType: string): Route[] {
    const allRoutes: Route[] = this.routes.get(from) || []
    if (resourceType === "any") {
      return allRoutes
    } else {
      return allRoutes.filter(r => r.type == resourceType)
    }
  }
}
