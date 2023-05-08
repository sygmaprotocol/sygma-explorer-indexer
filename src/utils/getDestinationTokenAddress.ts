//@ts-nocheck
import {
  Bridge__factory as BridgeFactory,
} from "@buildwithsygma/sygma-contracts"
import { EthereumSharedConfigDomain, SharedConfigFormated } from "types"

import { getProvider, getEVMHandlersMap } from "./helpers"

export async function getDestinationTokenAddress(
  resourceID: string,
  destinationDomainID: number,
  sygmaConfig: SharedConfigFormated[],
  resourceIdMatched: { type: "erc20" | "erc721" | "permissionlessGeneric", resourceId: string }
) {
  const destinationDomain = sygmaConfig.find(domain => domain.id === destinationDomainID) as EthereumSharedConfigDomain;

  // NOTE: provisional since there were some deposits that were done to substrate domain
  if (destinationDomain) {
    const provider = getProvider(destinationDomain)
    await provider.ready
    const handlersMap = getEVMHandlersMap(destinationDomain, provider)

    const bridgeContract = BridgeFactory.connect(destinationDomain.bridge, provider)
    const handlerAddress = await bridgeContract._resourceIDToHandlerAddress(resourceID)
    if (resourceIdMatched.resourceId === resourceID && resourceIdMatched.type !== "permissionlessGeneric") {
      const tokenAddress = await handlersMap[handlerAddress]._resourceIDToTokenContractAddress(resourceID)
      return tokenAddress
    }
  } else {
    console.log(`Destination domain with id ${destinationDomainID} not found`);
  }

}
