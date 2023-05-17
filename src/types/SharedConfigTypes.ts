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

export interface Domains<Type> {
  id: number;
  name: string;
  type: Type;
  bridge: string;
  nativeTokenSymbol: string;
  nativeTokenFullName: string;
  nativeTokenDecimals: number;
  blockConfirmations: number;
  startBlock: number;
  resources: Array<SharedConfigResources>;
};

export interface EthereumSharedConfigDomain extends Domains<"ethereum"> {
  handlers: Array<SharedConfigHandlers>;
  feeRouter: string;
  feeHandlers: Array<SharedConfigHandlers>;
}

export interface SubstrateSharedConfigDomain extends Domains<"substrate"> {
  handlers: [];
  feeRouter?: undefined;
  feeHandlers?: null;
}

export interface SharedConfigDomains {
  domains: Array<EthereumSharedConfigDomain | SubstrateSharedConfigDomain>;
}

export interface SharedConfig extends Domains<"ethereum" | "substrate"> {
  rpcUrl: string;
};

export type ConfigError = {
  error: { type: "config" | "shared-config"; message: string; name?: string };
};
