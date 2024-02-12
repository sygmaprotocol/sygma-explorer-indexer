import { Route } from "./types"

export const routesTestnet: Map<string, Route[]> = new Map([
  [
    "1",
    [
      { fromDomainId: "1", toDomainId: "2", resourceId: "0x0", type: "gmp" },
      { fromDomainId: "1", toDomainId: "2", resourceId: "0x1", type: "gmp" },
    ],
  ],
  ["2", []],
])
