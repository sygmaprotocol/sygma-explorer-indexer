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

export type EnvironmentResourcesMetadataConfig = {
  [key in Environment]?: EnvironmentResourcesMetadata
}

export const ResourcesMetadataConfig: EnvironmentResourcesMetadataConfig = {
  [Environment.TESTNET]: {
    2: [
      {
        caip19: "eip155:11155111/erc721:0x285207Cbed7AF3Bc80E05421D17AE1181d63aBd0",
        symbol: "ERC721TST",
        decimals: 0,
      },
      {
        caip19: "eip155:11155111/erc20:0x7d58589b6C1Ba455c4060a3563b9a0d447Bef9af",
        symbol: "ERC20TST",
        decimals: 18,
      },
      {
        caip19: "eip155:11155111/erc1155:0xc6DE9aa04eF369540A6A4Fa2864342732bC99d06",
        symbol: "ERC1155TST",
        decimals: 18,
      },
      {
        caip19: "eip155:11155111/erc20:0xc3cb14a020319f479ff164485008896a853dc8ca",
        symbol: "sygBTC",
        decimals: 8,
      },
      {
        caip19: "eip155:11155111/erc20:0xA9F30c6B5E7996D1bAd51D213277c30750bcBB36",
        symbol: "sygUSD",
        decimals: 6,
      },
      {
        caip19: "eip155:11155111/erc20:0xcaad55c60823150566f9e2f6040556dc00a67f5c",
        symbol: "tTNT",
        decimals: 18,
      },
      {
        caip19: "eip155:11155111/erc20:0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        symbol: "USDC",
        decimals: 6,
      },
      {
        caip19: "eip155:11155111/erc20:0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        symbol: "WETH",
        decimals: 18,
      },
    ],
    3: [
      {
        caip19: "polkadot:5231",
        symbol: "PHA",
        decimals: 12,
      },
      {
        caip19: "polkadot:5231",
        symbol: "sygUSD",
        decimals: 6,
      },
    ],
    5: [
      {
        caip19: "eip155:338/erc721:0x18A8E0748FA207483D23aeAc3D0508a25dDA3dB1",
        symbol: "ERC721TST",
        decimals: 0,
      },
      {
        caip19: "eip155:338/erc20:0x2938ED97eF9D897Dac7B21c48e045f34a3a02846",
        symbol: "ERC20LRTest",
        decimals: 18,
      },
      {
        caip19: "eip155:338/erc1155:0x0d3Ce33038a3E9bF940eCA6f5EADF355d47D36B3",
        symbol: "ERC1155TST",
        decimals: 18,
      },
      {
        caip19: "",
        symbol: "eth",
        decimals: 18,
      },
    ],
    6: [
      {
        caip19: "",
        symbol: "eth",
        decimals: 18,
      },
      {
        caip19: "eip155:17000/erc20:0x34d4fb8c45060143d39b7526c2b645d351af85a5",
        symbol: "sygBTC",
        decimals: 8,
      },
    ],
    8: [
      {
        caip19: "",
        symbol: "eth",
        decimals: 18,
      },
    ],
    9: [
      {
        caip19: "",
        symbol: "eth",
        decimals: 18,
      },
    ],
    10: [
      {
        caip19: "",
        symbol: "eth",
        decimals: 18,
      },
      {
        caip19: "eip155:84532/erc20:0xb947F89269F0cF54CC721BcDE298a46930f3418b",
        symbol: "sygUSD",
        decimals: 18,
      },
      {
        caip19: "eip155:84532/erc20:0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        symbol: "USDC",
        decimals: 6,
      },
      {
        caip19: "eip155:84532/erc20:0x4200000000000000000000000000000000000006",
        symbol: "WETH",
        decimals: 18,
      },
    ],
    11: [
      {
        caip19: "",
        symbol: "eth",
        decimals: 18,
      },
      {
        caip19: "eip155:80002/erc20:0x245466D2175bcED0A1ad1ce804C8F724D7050e85",
        symbol: "ERC20LRTest",
        decimals: 18,
      },
    ],
    12: [
      {
        caip19: "polkadot:3799",
        symbol: "tTNT",
        decimals: 18,
      },
      {
        caip19: "polkadot:3799",
        symbol: "sygUSD",
        decimals: 6,
      },
      {
        caip19: "polkadot:3799",
        symbol: "PHA",
        decimals: 12,
      },
    ],
    13: [
      {
        caip19: "bip122:000000000933ea01ad0ee984209779ba/slip44:0",
        symbol: "BTC",
        decimals: 8,
      },
    ],
    15: [
      {
        caip19: "",
        symbol: "eth",
        decimals: 18,
      },
      {
        caip19: "eip155:1993/erc20:0xE61e5ed4c4f198c5384Ef57E69aAD1eF0c911004",
        symbol: "USDC",
        decimals: 6,
      },
      {
        caip19: "eip155:1993/erc20:0x3538f4C55893eDca690D1e4Cf9Fb61FB70cd0DD8",
        symbol: "WETH",
        decimals: 18,
      },
    ],
    16: [
      {
        caip19: "eip155:3456/slip44:0",
        symbol: "BTC",
        decimals: 8,
      },
    ],
  },
  [Environment.MAINNET]: {
    1: [
      {
        caip19: "eip155:1/erc20:0x6c5bA91642F10282b576d91922Ae6448C9d52f4E",
        symbol: "PHA",
        decimals: 18,
      },
      {
        caip19: "",
        symbol: "",
        decimals: 18,
      },
    ],
    2: [
      {
        caip19: "polkadot:5232",
        symbol: "PHA",
        decimals: 12,
      },
    ],
    3: [
      {
        caip19: "polkadot:5233",
        symbol: "PHA",
        decimals: 12,
      },
    ],
    4: [
      {
        caip19: "",
        symbol: "",
        decimals: 18,
      },
    ],
    5: [
      {
        caip19: "",
        symbol: "",
        decimals: 18,
      },
    ],
    6: [
      {
        caip19: "",
        symbol: "",
        decimals: 18,
      },
    ],
    7: [
      {
        caip19: "",
        symbol: "",
        decimals: 18,
      },
    ],
  },
}
