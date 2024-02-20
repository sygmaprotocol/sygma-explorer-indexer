/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Route } from "./types"

export const routesTestnet: Map<string, Route[]> = new Map([
  [
    "2",
    [
      { fromDomainId: "2", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000300", type: "fungible" },
      { fromDomainId: "2", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000300", type: "fungible" },
      { fromDomainId: "2", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "2", toDomainId: "6", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "2", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "2", toDomainId: "8", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "2", toDomainId: "9", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "2", toDomainId: "3", resourceId: "0x0000000000000000000000000000000000000000000000000000000000001100", type: "fungible" },
    ],
  ],
  [
    "3",
    [
      { fromDomainId: "3", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000001100", type: "fungible" }
    ],
  ],
  [
    "5",
    [
      { fromDomainId: "5", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000300", type: "fungible" },
      { fromDomainId: "5", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "5", toDomainId: "6", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "5", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "5", toDomainId: "8", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "5", toDomainId: "9", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
    ],
  ],
  [
    "6",
    [
      { fromDomainId: "6", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "6", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "6", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "6", toDomainId: "9", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "6", toDomainId: "8", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
    ],
  ],
  [
    "7",
    [
      { fromDomainId: "7", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000300", type: "fungible" },
      { fromDomainId: "7", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "7", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "7", toDomainId: "6", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "7", toDomainId: "8", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "7", toDomainId: "9", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
    ],
  ],
  [
    "8",
    [
      { fromDomainId: "8", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "8", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "8", toDomainId: "6", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "8", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "8", toDomainId: "9", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
    ],
  ],
  [
    "9",
    [
      { fromDomainId: "9", toDomainId: "2", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "9", toDomainId: "5", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "9", toDomainId: "6", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "9", toDomainId: "7", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
      { fromDomainId: "9", toDomainId: "8", resourceId: "0x0000000000000000000000000000000000000000000000000000000000000500", type: "gmp" },
    ],
  ],
])
