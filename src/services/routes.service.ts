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
    console.log("FETCHINT ROUTES: " + from + "  " + resourceType)
    console.log(this.routes)
    const allRoutes: Route[] = this.routes.get(from) || []
    console.log(allRoutes)
    if (resourceType === "any") {
      return allRoutes
    } else {
      return allRoutes.filter(r => r.type == resourceType)
    }
  }
}
