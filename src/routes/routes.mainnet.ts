/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Route } from "./types"

export const routesMainnet: Map<string, Route[]> = new Map([
  [
    "1",
    [
      { fromDomainId: "1", toDomainId: "4", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "1", toDomainId: "6", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "1", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "1", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "1", toDomainId: "3", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000001", type: "fungible" },
    ],
  ],
  ["3", [{ fromDomainId: "3", toDomainId: "1", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000001", type: "fungible" }]],
  [
    "4",
    [
      { fromDomainId: "4", toDomainId: "1", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "4", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "4", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
    ],
  ],
  [
    "5",
    [
      { fromDomainId: "5", toDomainId: "1", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "5", toDomainId: "4", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "5", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
    ],
  ],
  [
    "6",
    [
      { fromDomainId: "6", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "6", toDomainId: "1", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
    ],
  ],
  [
    "7",
    [
      { fromDomainId: "7", toDomainId: "6", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "7", toDomainId: "4", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "7", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
      { fromDomainId: "7", toDomainId: "1", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000", type: "gmp" },
    ],
  ],
])
