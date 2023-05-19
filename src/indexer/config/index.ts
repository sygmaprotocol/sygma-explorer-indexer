import { testDomains } from "./testDomains"
import { devDomains } from "./devDomains"

export type LocalDomainConfig = {
  url: string
  startBlock: number
}

export enum Environment {
  TESTNET = "testnet",
  STAGE = "devnet",
}
export enum ResourceTypes {
  ERC20 = "erc20",
  ERC721 = "erc721",
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

type Resource = {
  resourceId: string
  type: ResourceTypes
  address: string
  symbol: string
  decimals: number
}

export const getLocalConfig = (): Map<number, string> => {
  return process.env.ENVIRONMENT == Environment.TESTNET ? testDomains : devDomains
}

export const getSharedConfig = async (url: string): Promise<SharedConfig> => {
  try {
    const response = await fetch(url)
    return await response.json()
  } catch (e) {
    console.error(`Failed to fecth config for ${process.env.STAGE}`, e)
    return Promise.reject(e)
  }
}
