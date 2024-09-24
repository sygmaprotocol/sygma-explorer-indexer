/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Environment } from "@buildwithsygma/core"

export type ResourceMetadata = {
  caip19: string
  symbol: string
  decimals: number
}

export type EnvironmentResourcesMetadata = {
  [key: number]: ResourceMetadata[]
}

export type DomainMetadata = {
  icon: string // icon
  name: string
  type: string
  caipId: string
  nativeTokenSymbol: string
  nativeTokenDecimals: number
  nativeTokenFullName: string
  blockExplorerUrl: string
  renderName: string
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
      icon: "https://scan.buildwithsygma.com/assets/icons/evm.svg",
      name: "Sepolia",
      caipId: "eip155:11155111",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "eth",
      type: "evm",
      blockExplorerUrl: "https://sepolia.etherscan.io",
      renderName: "Sepolia",
    },
    5: {
      icon: "https://scan.buildwithsygma.com/assets/icons/cronos.svg",
      name: "cronos",
      caipId: "eip155:338",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://explorer.cronos.org/testnet",
      renderName: "Cronos",
    },
    6: {
      icon: "https://scan.buildwithsygma.com/assets/icons/evm.svg",
      name: "holesky",
      caipId: "eip155:17000",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://holesky.etherscan.io",
      renderName: "Holesky",
    },
    8: {
      icon: "https://scan.buildwithsygma.com/assets/icons/arbitrum.svg",
      name: "arbitrum_sepolia",
      caipId: "eip155:421614",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://sepolia.arbiscan.io",
      renderName: "Arbitrum Sepolia",
    },
    9: {
      icon: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg",
      name: "gnosis_chiado",
      caipId: "eip155:10200",
      nativeTokenSymbol: "XDAI",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "xdai",
      type: "evm",
      blockExplorerUrl: "https://gnosis-chiado.blockscout.com",
      renderName: "Gnosis Chiado",
    },
    10: {
      icon: "https://scan.buildwithsygma.com/assets/icons/base.svg",
      name: "base_sepolia",
      caipId: "eip155:84532",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://sepolia.basescan.org",
      renderName: "Base Sepolia",
    },
    11: {
      icon: "https://scan.buildwithsygma.com/assets/icons/polygon.svg",
      name: "amoy",
      caipId: "eip155:80002",
      nativeTokenSymbol: "MATIC",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "matic",
      type: "evm",
      blockExplorerUrl: "https://amoy.polygonscan.com",
      renderName: "Amoy",
    },
    12: {
      icon: "https://scan.buildwithsygma.com/assets/icons/tangle-logo.svg",
      name: "tangle-standalone-testnet",
      caipId: "polkadot:3799",
      nativeTokenSymbol: "tTNT",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "tTNT",
      type: "substrate",
      blockExplorerUrl: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet-rpc.tangle.tools#/explorer/query",
      renderName: "Tangle Standalone Testnet",
    },
    13: {
      icon: "https://scan.buildwithsygma.com/assets/icons/Bitcoin.svg",
      name: "Bitcoin-Testnet3",
      caipId: "bip122:000000000933ea01ad0ee984209779ba",
      nativeTokenSymbol: "BTC",
      nativeTokenDecimals: 8,
      nativeTokenFullName: "Bitcoin",
      type: "btc",
      blockExplorerUrl: "https://sepolia.etherscan.io",
      renderName: "Bitcoin Testnet3",
    },
    15: {
      icon: "https://scan.buildwithsygma.com/assets/icons/b3-sepolia.svg",
      name: "b3-sepolia",
      caipId: "eip155:1993",
      nativeTokenSymbol: "ETH",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "eth",
      type: "evm",
      blockExplorerUrl: "https://sepolia.explorer.b3.fun",
      renderName: "B3 Sepolia",
    },
    16: {
      icon: "https://scan.buildwithsygma.com/assets/icons/layerEdge.svg",
      name: "layer_edge",
      caipId: "eip155:3456",
      nativeTokenSymbol: "BTC",
      nativeTokenDecimals: 8,
      nativeTokenFullName: "Bitcoin",
      type: "evm",
      blockExplorerUrl: "https://sepolia.etherscan.io",
      renderName: "Layer Edge",
    },
  },
  [Environment.MAINNET]: {
    1: {
      icon: "https://scan.buildwithsygma.com/assets/icons/evm.svg",
      name: "ethereum",
      caipId: "eip155:1",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://etherscan.io",
      renderName: "Ethereum",
    },
    2: {
      icon: "https://scan.buildwithsygma.com/assets/icons/khala.svg",
      name: "khala",
      caipId: "polkadot:5232",
      nativeTokenSymbol: "pha",
      nativeTokenDecimals: 12,
      nativeTokenFullName: "pha",
      type: "substrate",
      blockExplorerUrl: "https://khala.subscan.io",
      renderName: "Khala",
    },
    3: {
      icon: "https://scan.buildwithsygma.com/assets/icons/phala.svg",
      name: "phala",
      caipId: "polkadot:5233",
      nativeTokenSymbol: "pha",
      nativeTokenDecimals: 12,
      nativeTokenFullName: "pha",
      type: "substrate",
      blockExplorerUrl: "https://phala.subscan.io",
      renderName: "Phala",
    },
    4: {
      icon: "https://scan.buildwithsygma.com/assets/icons/cronos.svg",
      name: "cronos",
      caipId: "eip155:25",
      nativeTokenSymbol: "CRO",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "Cronos",
      type: "evm",
      blockExplorerUrl: "https://cronoscan.com",
      renderName: "Cronos",
    },
    5: {
      icon: "https://scan.buildwithsygma.com/assets/icons/base.svg",
      name: "base",
      caipId: "eip155:8453",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://basescan.org",
      renderName: "Base",
    },
    6: {
      icon: "https://scan.buildwithsygma.com/assets/icons/gnosis.svg",
      name: "gnosis",
      caipId: "eip155:100",
      nativeTokenSymbol: "XDAI",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "xDai",
      type: "evm",
      blockExplorerUrl: "https://gnosisscan.io",
      renderName: "Gnosis",
    },
    7: {
      icon: "https://scan.buildwithsygma.com/assets/icons/polygon.svg",
      name: "polygon",
      caipId: "eip155:137",
      nativeTokenSymbol: "MATIC",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "MATIC",
      type: "evm",
      blockExplorerUrl: "https://polygonscan.com",
      renderName: "Polygon",
    },
    8: {
      icon: "https://scan.buildwithsygma.com/assets/icons/b3-sepolia.svg",
      name: "b3",
      caipId: "eip155:8333",
      nativeTokenSymbol: "eth",
      nativeTokenDecimals: 18,
      nativeTokenFullName: "ether",
      type: "evm",
      blockExplorerUrl: "https://explorer.b3.fun/",
      renderName: "B3",
    },
  },
}
