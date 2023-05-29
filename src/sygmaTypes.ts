/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import {
  ERC20Handler,
  ERC721Handler
} from "@chainsafe/chainbridge-contracts"
export type TokenConfig = {
  address: string;
  name?: string;
  symbol?: string;
  imageUri?: string;
  resourceId: string;
  isNativeWrappedToken?: boolean;
};

export type ChainType = "Ethereum" | "Substrate";

export type BridgeConfig = {
  networkId?: number;
  domainId: number;
  name: string;
  rpcUrl: string;
  type: ChainType;
  decimals: number;
};

export type EvmBridgeConfig = BridgeConfig & {
  bridgeAddress: string;
  erc20HandlerAddress: string;
  erc721HandlerAddress: string;
  type: "Ethereum";
  deployedBlockNumber?: number;
  latestBlockNumber?: number;
};

export type SubstrateBridgeConfig = BridgeConfig & {
  type: "Substrate";
  chainbridgePalletName: string;
  bridgeFeeFunctionName?: string; // If this value is provided, the chain value will be used will be used
  bridgeFeeValue?: number; // If the above value is not provided, this value will be used for the fee. No scaling should be applied.
  transferPalletName: string;
  transferFunctionName: string;
  typesFileName: string;
};

export type SygmaConfig = {
  chains: Array<EvmBridgeConfig | SubstrateBridgeConfig>;
};

export type HandlersMap = {
  [key: string]: ERC20Handler | ERC721Handler
}
