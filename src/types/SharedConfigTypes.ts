export type SharedConfigResources = {
  resourceId: string
  type: "erc20" | "erc721" | "permissionedGeneric" | "permissionlessGeneric"
  address: string
  symbol: string
  decimals: number
}

export type SharedConfigHandlers = {
  type: "erc20" | "erc721" | "permissionedGeneric" | "permissionlessGeneric"
  address: string
}

export interface Domain<Type> {
  id: number
  chainId: number
  name: string
  type: Type
  bridge: string
  nativeTokenSymbol: string
  nativeTokenFullName: string
  nativeTokenDecimals: number
  blockConfirmations: number
  startBlock: number
  resources: Array<SharedConfigResources>
}

export interface EthereumSharedConfigDomain extends Domain<"ethereum"> {
  handlers: Array<SharedConfigHandlers>
  feeRouter: string
  feeHandlers: Array<SharedConfigHandlers>
}

export interface SubstrateDomain extends Domain<"substrate"> {
  handlers: []
  feeRouter?: undefined
  feeHandlers?: null
}

export interface SharedConfigDomains {
  domains: Array<EthereumSharedConfigDomain | SubstrateDomain>
}

export interface SharedConfig extends Domain<"ethereum" | "substrate"> {
  rpcUrl: string
}

export type ConfigError = {
  error: { type: "config" | "shared-config"; message: string; name?: string }
}
