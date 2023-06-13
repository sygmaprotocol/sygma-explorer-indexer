export type LocalDomainConfig = {
  url: string
  startBlock: number
}

export enum Environment {
  TESTNET = "testnet",
  STAGE = "devnet",
}
export const enum ResourceTypes {
  FUNGIBLE = "fungible",
  NON_FUNGIBLE = "nonFungible",
  PERMISSIONED_GENERIC = "permissionedGeneric",
  PERMISSIONLESS_GENERIC = "permissionlessGeneric",
}

export type SharedConfig = {
  domains: Array<Domain>
}

export enum DomainTypes {
  EVM = "evm",
  SUBSTRATE = "substrate",
}

export type Domain = {
  id: number
  name: string
  type: DomainTypes
  bridge: string
  feeHandlers: Array<FeeHandlerType>
  handlers: Array<Handler>
  nativeTokenSymbol: string
  nativeTokenDecimals: number
  startBlock: number
  resources: Array<Resource>
}
type Handler = {
  type: ResourceTypes
  address: string
}

type FeeHandlerType = {
  type: string
  address: string
}

export type Resource = {
  resourceId: string
  type: ResourceTypes
  address: string
  symbol: string
  decimals: number
}

export type RpcUrlConfig = Array<{
  id: number
  endpoint: string
}>

export const getSharedConfig = async (url: string): Promise<SharedConfig> => {
  try {
    const response = await fetch(url)
    return (await response.json()) as SharedConfig
  } catch (e) {
    console.error(`Failed to fecth config for ${process.env.STAGE || ""}`, e)
    return Promise.reject(e)
  }
}

export const getSsmDomainConfig = (): Map<number, string> => {
  const parsedResponse = JSON.parse(process.env.RPC_URL_CONFIG!) as RpcUrlConfig
  const rpcUrlMap = new Map<number, string>()
  for (const rpcConfig of parsedResponse) {
    rpcUrlMap.set(rpcConfig.id, rpcConfig.endpoint)
  }

  return rpcUrlMap
}

// Note: based on the actual env vars that we pass, map the domains that we are going to use
export const getDomainsToIndex = (domains: Domain[]): Domain[] => {
  const parsedResponse = JSON.parse(process.env.RPC_URL_CONFIG!) as RpcUrlConfig

  const domainsToUse = domains.filter(domain => {
    const domainToIndex = parsedResponse.find(rpcData => rpcData.id === domain.id)
    return domainToIndex !== undefined
  })

  return domainsToUse
}
