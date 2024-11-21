/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { EthereumConfig, SubstrateConfig } from "@buildwithsygma/core"

export type LocalDomainConfig = {
  url: string
  startBlock: number
}

export type RpcUrlConfig = Array<{
  id: number
  endpoint: string
}>

export const getSsmDomainConfig = (): Map<number, string> => {
  const parsedResponse = JSON.parse(process.env.RPC_URL_CONFIG!) as RpcUrlConfig
  const rpcUrlMap = new Map<number, string>()
  for (const rpcConfig of parsedResponse) {
    rpcUrlMap.set(rpcConfig.id, rpcConfig.endpoint)
  }

  return rpcUrlMap
}

// Note: based on the actual env vars that we pass, map the domains that we are going to use
export const getDomainsToIndex = (domains: Array<EthereumConfig | SubstrateConfig>): Array<EthereumConfig | SubstrateConfig> => {
  const parsedResponse = JSON.parse(process.env.RPC_URL_CONFIG!) as RpcUrlConfig

  return domains.filter(domain => {
    const domainToIndex = parsedResponse.find(rpcData => rpcData.id === domain.id)
    return domainToIndex !== undefined
  })
}
