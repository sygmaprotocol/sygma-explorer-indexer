/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Environment } from "@buildwithsygma/sygma-sdk-core"

export type DomainMetadata = {
  url: string // icon url
}

export type EnvironmentMetadata = {
  [key: number]: DomainMetadata
}

export type EnvironmentMetadataConfigType = {
  [key in Environment]?: EnvironmentMetadata
}

export const DomainMetadataConfig: EnvironmentMetadataConfigType = {
  [Environment.TESTNET]: {
    1: { url: "https://scan.buildwithsygma.com/assets/icons/all.svg" },
    2: { url: "https://scan.buildwithsygma.com/assets/icons/all.svg" },
    3: { url: "https://scan.buildwithsygma.com/assets/icons/phala-black.svg" },
    4: { url: "https://scan.buildwithsygma.com/assets/icons/base.svg" },
    5: { url: "https://scan.buildwithsygma.com/assets/icons/cronos.svg" },
    6: { url: "https://scan.buildwithsygma.com/assets/icons/all.svg" },
    7: { url: "https://scan.buildwithsygma.com/assets/icons/polygon.svg" },
    8: { url: "https://scan.buildwithsygma.com/assets/icons/arbitrum.svg" },
    9: { url: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg" },
  },
  [Environment.MAINNET]: {
    1: { url: "https://scan.buildwithsygma.com/assets/icons/all.svg" },
    2: { url: "https://scan.buildwithsygma.com/assets/icons/khala.svg" },
    3: { url: "https://scan.buildwithsygma.com/assets/icons/phala.svg" },
    4: { url: "https://scan.buildwithsygma.com/assets/icons/cronos.svg" },
    5: { url: "https://scan.buildwithsygma.com/assets/icons/base.svg" },
    6: { url: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg" },
    7: { url: "https://scan.buildwithsygma.com/assets/icons/polygon.svg" },
  },
}
