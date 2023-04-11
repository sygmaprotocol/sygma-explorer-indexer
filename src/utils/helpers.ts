import { CeloProvider } from "@celo-tools/celo-ethers-wrapper"
import { ethers, BigNumber, utils } from "ethers"
import { TransfersByCursorOptions } from "services/transfers.service"
import { EvmBridgeConfig, HandlersMap, SubstrateBridgeConfig, SygmaConfig } from "../sygmaTypes"

import {
  Bridge,
  Bridge__factory as BridgeFactory,
  ERC20Handler__factory as Erc20HandlerFactory,
  ERC721Handler__factory as Erc721HandlerFactory,
  ERC20Handler,
  ERC721Handler
} from "@chainsafe/chainbridge-contracts"
import { Config, SharedConfigDomains } from "types"

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

export function formatConfig(config: SharedConfigDomains, stage: "devnet" | "testnet" | "mainnet" | "local") {
  const formatedConfig = config.domains.map((domain) => ({
    domainId: `${domain.id}`,
    name: stage === 'devnet' ? getNetworkNameFromMap(domain.id, mapedDomainDevnet) : getNetworkNameFromMap(domain.id, mapedDomainTestnet),
    decimals: domain.nativeTokenDecimals,
    nativeTokenSymbol: domain.nativeTokenSymbol.toUpperCase(),
    type: domain.type === "evm" ? "Ethereum" : "Substrate",
    bridgeAddress: domain.bridge,
    feeRouterAddress: domain.feeRouterAddress || "",
    erc20HandlerAddress:
      domain.handlers.length &&
      domain.handlers.filter((handler) => handler.type === "erc20")[0].address,
    erc721HandlerAddress:
      domain.handlers.length &&
      domain.handlers.filter((handler) => handler.type === "erc721")[0].address,
    tokens: [
      ...domain.resources.map((resource) => ({
        address: resource.address,
        decimals: resource.decimals,
        resourceId: resource.resourceId,
        type: resource.type,
        symbol: resource.symbol,
        feeSettings: { type: "", address: "" },
        name: resource.symbol,
      })),
    ].filter(
      (resource) =>
        resource.type !== "permissionlessGeneric" && resource.address !== ""
    ),
    confirmations: domain.blockConfirmations,
    feeHandlers: domain.feeHandlers,
    rpcUrl: stage === "devnet" ? getRPCUrl(domain.id, mapedDomainDevnet) : getRPCUrl(domain.id, mapedDomainTestnet),
  }))

  return formatedConfig as Config[]
}

const getRPCUrl = (id: number, mapedDomain: Array<{id: number, rpcUrl: string}>): string => {
  const domainFound = mapedDomain.find(domain => domain.id === id)
  return domainFound?.rpcUrl! || "";
};

const getNetworkNameFromMap = (id: number, mapedDomain: Array<{id: number, name: string}>): string => {
  const networkFound = mapedDomain.find(domain => domain.id === id)
  return networkFound?.name! || "";
};

const mapedDomainDevnet = [
  {
    id: 0,
    name: 'Goerli',
    rpcUrl: "https://eth-goerli.g.alchemy.com/v2/wkF4rGEBspanIYTCzspMVFbOPjHP_IhL"
  },
  {
    id: 1,
    name: "Mumbai",
    rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/LquJll0ZH2yYtHx74WScXNSXAj8C1DsP"
  },
  {
    id: 2,
    name: "Moonbase Alpha",
    rpcUrl: "https://moonbase-alpha.blastapi.io/be6f59cb-0c85-444f-b8bc-4179bd203cac"
  },
  {
    id: 3,
    name: "Sepolia",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/XEdjTRcsZFKjg7Cqx7C6l5KODNZGDxuY"
  }
]

const mapedDomainTestnet = [
  {
    id: 1,
    name: "Goerli",
    rpcUrl: "https://eth-goerli.g.alchemy.com/v2/wkF4rGEBspanIYTCzspMVFbOPjHP_IhL"
  },
  {
    id: 2,
    name: "Moonbase Alpha",
    rpcUrl: "https://moonbase-alpha.blastapi.io/be6f59cb-0c85-444f-b8bc-4179bd203cac"
  },
  {
    id: 3,
    name: "Mumbai",
    rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/LquJll0ZH2yYtHx74WScXNSXAj8C1DsP"
  },
  {
    id: 4,
    name: "Sepolia",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/XEdjTRcsZFKjg7Cqx7C6l5KODNZGDxuY"
  }
]

// Note: if we use the above approach, we will need to created a mapping for mainnet and local