import {
  Erc20HandlerFactory,
} from "@chainsafe/chainbridge-contracts"

import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"
import { getProvider } from "./helpers"

export async function getDestinationTokenAddress(resourceID: string, destinationDomainID: number, config: ChainbridgeConfig) {
  const bridge = config.chains.find(bridge => bridge.domainId === destinationDomainID) as EvmBridgeConfig
  const provider = getProvider(bridge)
  await provider.ready
  const erc20HandlerContract = Erc20HandlerFactory.connect(
    bridge.erc20HandlerAddress,
    provider
  )
  const tokenAddress = await erc20HandlerContract._resourceIDToTokenContractAddress(resourceID)
  return tokenAddress
}
