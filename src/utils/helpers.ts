import { CeloProvider } from "@celo-tools/celo-ethers-wrapper"
import { ethers, BigNumber, utils } from "ethers"
import { TransfersByCursorOptions } from "services/transfers.service"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const isCelo = (networkId?: number) =>
  [42220, 44787, 62320].includes(networkId ?? 0)

const getRpcProviderFromHttpUrl = (url: string) => {
  const urlInstance = new URL(url)
  if (urlInstance.username && urlInstance.password) {
    const urlInfo = {
      url: urlInstance.hostname,
      user: urlInstance.username,
      password: urlInstance.password,
    }
    return new ethers.providers.JsonRpcProvider(urlInfo)
  }
  return new ethers.providers.JsonRpcProvider(url)
}

const getRpcProviderFromWebsocket = (
  destinationChainConfig: EvmBridgeConfig
) => {
  const { rpcUrl, networkId } = destinationChainConfig
  if (rpcUrl.includes("infura")) {
    const parts = rpcUrl.split("/")

    return new ethers.providers.InfuraWebSocketProvider(
      networkId,
      parts[parts.length - 1]
    )
  } else if (rpcUrl.includes("alchemyapi")) {
    const parts = rpcUrl.split("/")

    return new ethers.providers.AlchemyWebSocketProvider(
      networkId,
      parts[parts.length - 1]
    )
  } else {
    return new ethers.providers.WebSocketProvider(rpcUrl, networkId)
  }
}

export function getProvider(destinationChainConfig: EvmBridgeConfig) {
  if (isCelo(destinationChainConfig.networkId)) {
    return new CeloProvider(destinationChainConfig.rpcUrl)
  } else if (destinationChainConfig.rpcUrl.startsWith("wss")) {
    return getRpcProviderFromWebsocket(destinationChainConfig)
  } else {
    return getRpcProviderFromHttpUrl(destinationChainConfig?.rpcUrl)
  }
}

export function jsonStringifyWithBigInt(value: any) {
  if (value !== undefined) {
    return JSON.stringify(value, (_, v) =>
      typeof v === "bigint" ? `${v}n` : v
    )
  }
}

export function getNetworkName(
  domainId: number,
  chainbridgeConfig: ChainbridgeConfig
) {
  return (
    chainbridgeConfig.chains.find((c) => c.domainId === domainId)?.name || ""
  )
}

export function decodeDataHash(data: string, decimals: number) {
  const decodedData = ethers.utils.defaultAbiCoder.decode(["uint", "uint"], data)
  const destinationRecipientAddressLen = decodedData[1].toNumber() * 2 // adjusted for bytes
  const result = {
    amount: decodedData[0].toString(),
    destinationRecipientAddress: `0x${data.slice(130, 130 + destinationRecipientAddressLen)}`
  }
  return result
}

export function buildQueryParamsToPasss(args: any): TransfersByCursorOptions {
  const { before, first, after, last, filters } = args
  const beforeCursor = before?.toString()
  const firstCursor = first ? parseInt(first?.toString()) : undefined
  const afterCursor = after?.toString()
  const lastCursor = last ? parseInt(last?.toString()) : undefined

  if (filters !== undefined) {
    return {
      before: beforeCursor,
      after: afterCursor,
      first: firstCursor,
      last: lastCursor,
      filters
    }
  }
  return {
    before: beforeCursor,
    after: afterCursor,
    first: firstCursor,
    last: lastCursor
  }
}
