import {
  Bridge__factory as BridgeFactory,
} from "@buildwithsygma/sygma-contracts"

import { ChainbridgeConfig, EvmBridgeConfig, HandlersMap } from "../sygmaTypes"
import { getProvider, getHandlersMap } from "./helpers"

export async function getDestinationTokenAddress(
  resourceID: string,
  destinationDomainID: number,
  config: ChainbridgeConfig,
) {
  const bridge = config.chains.find(bridge => bridge.domainId === destinationDomainID) as EvmBridgeConfig
  const provider = getProvider(bridge)
  await provider.ready
  const handlersMap = getHandlersMap(bridge, provider)
  
  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)
  const handlerAddress = await bridgeContract._resourceIDToHandlerAddress(resourceID)
  const tokenAddress = await handlersMap[handlerAddress]._resourceIDToTokenContractAddress(resourceID)
  return tokenAddress
}
