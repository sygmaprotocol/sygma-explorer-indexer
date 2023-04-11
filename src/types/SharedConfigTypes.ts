export type SharedConfigResources = {
  resourceId: string;
  type: "erc20" | "erc721" | "permissionedGeneric" | "permissionlessGeneric";
  address: string;
  symbol: string;
  decimals: number;
};

export type SharedConfigHandlers = {
  type: "erc20" | "erc721" | "permissionedGeneric" | "permissionlessGeneric";
  address: string;
};

export type SharedConfigDomain = {
  id: number;
  name: string;
  type: "evm" | "substrate";
  bridge: string;
  feeRouterAddress: string;
  handlers: SharedConfigHandlers[];
  nativeTokenSymbol: string;
  nativeTokenFullName: string;
  nativeTokenDecimals: number;
  blockConfirmations: number;
  startBlock: number;
  resources: SharedConfigResources[];
  feeHandlers: Array<{ address: string; type: "basic" | "oracle" }>;
};

export type SharedConfigDomains = {
  domains: SharedConfigDomain[];
};

export type ConfigError = {
  error: { type: "config" | "shared-config"; message: string; name?: string };
};

export type Config = {
  domainId: string,
  name: string,
  decimals: number,
  nativeTokenSymbol: string,
  type: "Ethereum" | "Substrate",
  bridgeAddress: string,
  feeRouterAddress: string,
  erc20HandlerAddress: string,
  erc721HandlerAddress: string,
  tokens: Array<{
    address: string,
    decimals: number,
    resourceId: string,
    type: string,
    symbol: string,
    feeSettings: { type: string, address: string },
    name: string,
  }>,
  confirmations: number,
  feeHandlers: Array<{ address: string, type: "basic" | "oracle" }>,
  rpcUrl: string,
}

export type IndexerSharedConfig = {
  chains: Config[],
}
