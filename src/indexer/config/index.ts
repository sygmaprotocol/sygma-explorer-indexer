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
  const parsedResponse = JSON.parse(
    process.env.RPC_URL_CONFIG ||
      // remove this after testing
      `[
    {
        "id": 1,
        "endpoint": "https://eth-goerli.g.alchemy.com/v2/MQcsWqD94N1zldBRzG9XkdBM88LzgQLh"
    },
    {
        "id": 2,
        "endpoint": "https://eth-sepolia.g.alchemy.com/v2/M3RtUsouiiQ2KgADdSJq2pzWfhr4CXoW"
    },
    {
        "id": 100,
        "endpoint": "https://canto-testnet.plexnode.wtf"
    },
    {
      "id": 101,
      "endpoint": "https://rpc.gnosischain.com/"
    }
  ]`,
  ) as RpcUrlConfig
  const rpcUrlMap = new Map<number, string>()
  for (const rpcConfig of parsedResponse) {
    rpcUrlMap.set(rpcConfig.id, rpcConfig.endpoint)
  }
  return rpcUrlMap
}
