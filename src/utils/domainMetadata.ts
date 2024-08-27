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
  blockExplorerUrl: string
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
      blockExplorerUrl: "https://sepolia.etherscan.io",
    },
    5: {
      url: "https://scan.buildwithsygma.com/assets/icons/cronos.svg",
      name: "cronos",
      caipId: "eip155:338",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://explorer.cronos.org/testnet",
    },
    6: {
      url: "https://scan.buildwithsygma.com/assets/icons/evm.svg",
      name: "holesky",
      caipId: "eip155:17000",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://holesky.etherscan.io",
    },
    8: {
      url: "https://scan.buildwithsygma.com/assets/icons/arbitrum.svg",
      name: "arbitrum_sepolia",
      caipId: "eip155:421614",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://sepolia.arbiscan.io",
    },
    9: {
      url: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg",
      name: "gnosis_chiado",
      caipId: "eip155:10200",
      nativeTokenSymbol: "XDAI",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "xdai",
      type: "evm",
      blockExplorerUrl: "https://gnosis-chiado.blockscout.com",
    },
    10: {
      url: "",
      name: "base_sepolia",
      caipId: "eip155:84532",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://sepolia.basescan.org",
    },
    11: {
      url: "",
      name: "amoy",
      caipId: "eip155:80002",
      nativeTokenSymbol: "MATIC",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "matic",
      type: "evm",
      blockExplorerUrl: "https://amoy.polygonscan.com",
    },
    12: {
      url: "",
      name: "tangle-standalone-testnet",
      caipId: "polkadot:3799",
      nativeTokenSymbol: "tTNT",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "tTNT",
      type: "substrate",
      blockExplorerUrl: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet-rpc.tangle.tools#/explorer/query",
    },
    13: {
      url: "",
      name: "Bitcoin-Testnet3",
      caipId: "bip122:000000000933ea01ad0ee984209779ba",
      nativeTokenSymbol: "BTC",
      nativeTokenDecimals: 8,
      nativeTokenFullName: "Bitcoin",
      type: "btc",
      blockExplorerUrl: "https://sepolia.etherscan.io",
    },
    15: {
      url: "",
      name: "b3-sepolia",
      caipId: "eip155:1993",
      nativeTokenSymbol: "ETH",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "eth",
      type: "evm",
      blockExplorerUrl: "https://sepolia.explorer.b3.fun",
    },
    16: {
      url: "",
      name: "layer_edge",
      caipId: "eip155:3456",
      nativeTokenSymbol: "BTC",
      nativeTokenDecimals: 8,
      nativeTokenFullName: "Bitcoin",
      type: "evm",
      blockExplorerUrl: "https://sepolia.etherscan.io",
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
      blockExplorerUrl: "https://etherscan.io",
    },
    2: {
      url: "https://scan.buildwithsygma.com/assets/icons/khala.svg",
      name: "khala",
      caipId: "polkadot:5232",
      nativeTokenSymbol: "pha",
      nativeTokenDecimals: 12,
      nativeTokenFullName: "pha",
      type: "substrate",
      blockExplorerUrl: "https://khala.subscan.io",
    },
    3: {
      url: "https://scan.buildwithsygma.com/assets/icons/phala.svg",
      name: "phala",
      caipId: "polkadot:5233",
      nativeTokenSymbol: "pha",
      nativeTokenDecimals: 12,
      nativeTokenFullName: "pha",
      type: "substrate",
      blockExplorerUrl: "https://phala.subscan.io",
    },
    4: {
      url: "https://scan.buildwithsygma.com/assets/icons/cronos.svg",
      name: "cronos",
      caipId: "eip155:25",
      nativeTokenSymbol: "CRO",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "Cronos",
      type: "evm",
      blockExplorerUrl: "https://cronoscan.com",
    },
    5: {
      url: "https://scan.buildwithsygma.com/assets/icons/base.svg",
      name: "base",
      caipId: "eip155:8453",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://basescan.org",
    },
    6: {
      url: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg",
      name: "gnosis",
      caipId: "eip155:100",
      nativeTokenSymbol: "XDAI",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "xDai",
      type: "evm",
      blockExplorerUrl: "https://gnosisscan.io",
    },
    7: {
      url: "https://scan.buildwithsygma.com/assets/icons/polygon.svg",
      name: "polygon",
      caipId: "eip155:137",
      nativeTokenSymbol: "MATIC",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "MATIC",
      type: "evm",
      blockExplorerUrl: "https://polygonscan.com",
    },
  },
}
