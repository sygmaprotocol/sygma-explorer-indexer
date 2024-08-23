/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Environment } from "@buildwithsygma/sygma-sdk-core"

export type ResourceMetadata = {
  caip19: string
  symbol: string
  decimals: number
}

export type EnvironmentResourcesMetadata = {
  [key: number]: ResourceMetadata[]
}

export type DomainMetadata = {
  url: string // icon url
  name: string
  type: string
  caipId: string
  nativeTokenSymbol: string
  nativeTokenDecimals: number
  nativeTokenFullName: string
}

export type EnvironmentMetadata = {
  [key: number]: DomainMetadata
}

export type EnvironmentMetadataConfigType = {
  [key in Environment]?: EnvironmentMetadata
}

export const DomainMetadataConfig: EnvironmentMetadataConfigType = {
  [Environment.TESTNET]: {
    2: {
      url: "https://scan.buildwithsygma.com/assets/icons/evm.svg",
      name: "Sepolia",
      caipId: "eip155:11155111",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "eth",
      type: "evm",
    },
    3: {
      url: "https://scan.buildwithsygma.com/assets/icons/phala-black.svg",
      name: "rococo-phala",
      caipId: "polkadot:5231",
      nativeTokenSymbol: "pha",
      nativeTokenDecimals: 12,
      nativeTokenFullName: "pha",
      type: "substrate",
    },
    5: {
      url: "https://scan.buildwithsygma.com/assets/icons/cronos.svg",
      name: "cronos",
      caipId: "eip155:338",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
    },
    6: {
      url: "https://scan.buildwithsygma.com/assets/icons/evm.svg",
      name: "holesky",
      caipId: "eip155:17000",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
    },
    8: {
      url: "https://scan.buildwithsygma.com/assets/icons/arbitrum.svg",
      name: "arbitrum_sepolia",
      caipId: "eip155:421614",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
    },
    9: {
      url: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg",
      name: "gnosis_chiado",
      caipId: "eip155:10200",
      nativeTokenSymbol: "XDAI",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "xdai",
      type: "evm",
    },
    10: {
      url: "",
      name: "base_sepolia",
      caipId: "eip155:84532",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
    },
    11: {
      url: "",
      name: "amoy",
      caipId: "eip155:80002",
      nativeTokenSymbol: "MATIC",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "matic",
      type: "evm",
    },
    12: {
      url: "",
      name: "tangle-standalone-testnet",
      caipId: "polkadot:3799",
      nativeTokenSymbol: "tTNT",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "tTNT",
      type: "substrate",
    },
    13: {
      url: "",
      name: "Bitcoin-Testnet3",
      caipId: "bip122:000000000933ea01ad0ee984209779ba",
      nativeTokenSymbol: "BTC",
      nativeTokenDecimals: 8,
      nativeTokenFullName: "Bitcoin",
      type: "btc",
    },
    15: {
      url: "",
      name: "b3-sepolia",
      caipId: "eip155:1993",
      nativeTokenSymbol: "ETH",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "eth",
      type: "evm",
    },
    16: {
      url: "",
      name: "layer_edge",
      caipId: "eip155:3456",
      nativeTokenSymbol: "BTC",
      nativeTokenDecimals: 8,
      nativeTokenFullName: "Bitcoin",
      type: "evm",
    },
  },
  [Environment.MAINNET]: {
    1: {
      url: "https://scan.buildwithsygma.com/assets/icons/evm.svg",
      name: "ethereum",
      caipId: "eip155:1",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
    },
    2: {
      url: "https://scan.buildwithsygma.com/assets/icons/khala.svg",
      name: "khala",
      caipId: "polkadot:5232",
      nativeTokenSymbol: "pha",
      nativeTokenDecimals: 12,
      nativeTokenFullName: "pha",
      type: "substrate",
    },
    3: {
      url: "https://scan.buildwithsygma.com/assets/icons/phala.svg",
      name: "phala",
      caipId: "polkadot:5233",
      nativeTokenSymbol: "pha",
      nativeTokenDecimals: 12,
      nativeTokenFullName: "pha",
      type: "substrate",
    },
    4: {
      url: "https://scan.buildwithsygma.com/assets/icons/cronos.svg",
      name: "cronos",
      caipId: "eip155:25",
      nativeTokenSymbol: "CRO",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "Cronos",
      type: "evm",
    },
    5: {
      url: "https://scan.buildwithsygma.com/assets/icons/base.svg",
      name: "base",
      caipId: "eip155:8453",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
    },
    6: {
      url: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg",
      name: "gnosis",
      caipId: "eip155:100",
      nativeTokenSymbol: "XDAI",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "xDai",
      type: "evm",
    },
    7: {
      url: "https://scan.buildwithsygma.com/assets/icons/polygon.svg",
      name: "polygon",
      caipId: "eip155:137",
      nativeTokenSymbol: "MATIC",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "MATIC",
      type: "evm",
    },
  },
}
