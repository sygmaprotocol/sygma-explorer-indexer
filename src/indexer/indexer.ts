// @ts-nocheck
import {
  Bridge__factory as BridgeFactory,
  ERC20Handler__factory as Erc20HandlerFactory,
  ERC721Handler__factory as Erc721HandlerFactory,
} from "@buildwithsygma/sygma-contracts"
import { SygmaConfig, EvmBridgeConfig, HandlersMap } from "../sygmaTypes"
import { getProvider } from "../utils/helpers"

import { saveEvmDeposits } from "./saveDeposits"
import { saveProposals } from "./saveProposals"
import { saveFailedHandlerExecutions } from "./saveFailedHandlerExecutions"
import { Config, EthereumSharedConfigDomain, IndexerSharedConfig, SharedConfigFormated, SubstrateSharedConfigDomain } from "types"

export async function indexEvmDeposits(
  domain: EthereumSharedConfigDomain,
  sygmaConfig: SharedConfigFormated[]
) {
  console.log(`\nChecking depostis for ${domain.name}`)

  const provider = getProvider(domain)
  try {
    await provider.ready
  } catch(e){
    console.error('Error on provider.ready', e);
  }
  
  const { bridge } = domain

  const bridgeContract = BridgeFactory.connect(bridge, provider)

  const mapResourceIdToTypeOfResource = domain.resources.map((resource) => ({
    resourceId: resource.resourceId,
    type: resource.type,
  }));
  
  await saveEvmDeposits({
    domain,
    bridgeContract,
    provider,
    mapResourceIdToTypeOfResource,
    sygmaConfig
  });
}

// export async function indexProposals(bridge: Config, config: SygmaConfig) {
//   console.log(`\nChecking proposals executions for ${bridge.name}`)

//   const provider = getProvider(bridge)
//   await provider.ready

//   const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)

//   await saveProposals(bridge, bridgeContract, provider, config)
// }

// export async function indexFailedHandlerExecutions(bridge: EvmBridgeConfig, config: SygmaConfig) {
//   console.log(`Checking failed handler exectutions for ${bridge.name}`)

//   const provider = getProvider(bridge)
//   await provider.ready

//   const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)

//   await saveFailedHandlerExecutions(bridge, bridgeContract, provider, config)
// }
