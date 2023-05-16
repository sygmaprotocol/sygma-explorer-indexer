import dotenv from "dotenv"
import { SharedConfigDomains, SharedConfigFormated } from "types"
import { formatConfig } from "../../utils/helpers"
import { testDomains, devDomains, DomainConfig } from "."

enum Environment {
  TESTNET = "testnet",
  STAGE = "devnet",
}
enum ResourceTypes {
  ERC20 = "erc20",
  ERC721 = "erc721",
  PERMISSIONED_GENERIC = "permissionedGeneric",
  PERMISSIONLESS_GENERIC = "permissionlessGeneric",
}

type SharedConfig = {
  domains: Array<Domain>
}

type Domain = {
  id: number
  name: string
  type: string
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
  resourceID: string
  type: ResourceTypes
  address: string
  symbol: string
  decimals: number
}
export const getLocalConfig = (): Map<number, DomainConfig> => {
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
