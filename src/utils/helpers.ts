import { CeloProvider } from "@celo-tools/celo-ethers-wrapper"
import { ethers } from "ethers"
import { TransfersByCursorOptions } from "services/transfers.service"
import { EvmBridgeConfig, HandlersMap, SubstrateBridgeConfig, SygmaConfig } from "../sygmaTypes"
import devnetMapedRPCUrls from "../rpcUrlMappings/devnet.json"
import testnetMapedRPCUrls from "../rpcUrlMappings/testnet.json"
import localMapedRPCUrls from "../rpcUrlMappings/local.json"

import {
  Bridge,
  Bridge__factory as BridgeFactory,
  ERC20Handler__factory as Erc20HandlerFactory,
  ERC721Handler__factory as Erc721HandlerFactory,
  ERC20Handler,
  ERC721Handler
} from "@chainsafe/chainbridge-contracts"
import { SharedConfigDomains, SharedConfigFormated } from "types"

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
  sygmaConfig: SygmaConfig
) {
  return (
    sygmaConfig.chains.find((c) => c.domainId === domainId)?.name || ""
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

export function getHandlersMap(bridge: EvmBridgeConfig, provider: ethers.providers.JsonRpcProvider) {
  const erc20HandlerContract = Erc20HandlerFactory.connect(
    bridge.erc20HandlerAddress,
    provider
  )
  const erc721HandlerContract = Erc721HandlerFactory.connect(
    bridge.erc721HandlerAddress,
    provider
  )

  const handlersMap: HandlersMap = {}
  handlersMap[bridge.erc20HandlerAddress] = erc20HandlerContract
  handlersMap[bridge.erc721HandlerAddress] = erc721HandlerContract
  return handlersMap
}

export function formatConfig(config: SharedConfigDomains, stage: "devnet" | "testnet" | "mainnet" | "local"): SharedConfigFormated[] {
  const mapedRPCUrlPerStage = getRPCUrlMapping(stage)

  const formatedConfig = config.domains.map((domain) => ({
    id: domain.id,
    name: getNetworkNameFromMap(domain.id, mapedRPCUrlPerStage),
    decimals: domain.nativeTokenDecimals,
    nativeTokenSymbol: domain.nativeTokenSymbol.toUpperCase(),
    type: domain.type,
    bridge: domain.bridge,
    feeRouter: domain.feeRouter || "",
    handlers: domain.handlers,
    resources: [
      ...domain.resources.map((resource) => ({
        address: resource.address,
        decimals: resource.decimals,
        resourceId: resource.resourceId,
        type: resource.type,
        symbol: resource.symbol,
      })),
    ],
    blockConfirmations: domain.blockConfirmations,
    feeHandlers: domain.feeHandlers,
    rpcUrl: getRPCUrl(domain.id, mapedRPCUrlPerStage),
    nativeTokenFullName: domain.nativeTokenFullName,
    nativeTokenDecimals: domain.nativeTokenDecimals,
    startBlock: domain.startBlock,
  }))

  return formatedConfig
}

const getRPCUrl = (id: number, mapedDomain: Array<{id: number, rpcUrl: string}>): string => {
  const domainFound = mapedDomain.find(domain => domain.id === id)
  return domainFound?.rpcUrl! || "";
};

const getNetworkNameFromMap = (id: number, mapedDomain: Array<{id: number, name: string}>): string => {
  const networkFound = mapedDomain.find(domain => domain.id === id)
  return networkFound?.name! || "";
};

const getRPCUrlMapping = (stage: string) => {
  if (stage === "devnet") {
    return devnetMapedRPCUrls
  } else if (stage === "testnet") {
    return testnetMapedRPCUrls
  } else if(stage === 'local') {
    return localMapedRPCUrls
  } else {
    throw new Error("Invalid stage")
  }
}

export const returnQueryParamsForTransfers = () => {
  return {
    include: {
      resource: {
        select: {
          type: true,
          resourceId: true,
        }
      },
      toDomain: {
        select: {
          name: true,
          lastIndexedBlock: true,
          domainId: true,
        }
      },
      fromDomain: {
        select: {
          name: true,
          lastIndexedBlock: true,
          domainId: true,
        }
      },
      fee: {
        select: {
          amount: true,
          tokenAddress: true,
          tokenSymbol: true,
        }
      },
      deposit: {
        select: {
          txHash: true,
          blockNumber: true,
          depositData: true,
          handlerResponse: true,
        }
      }
    }
  }
}