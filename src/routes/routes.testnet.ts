/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
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
