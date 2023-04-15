import {
  Bridge__factory as BridgeFactory,
  ERC20Handler__factory as Erc20HandlerFactory,
  ERC721Handler__factory as Erc721HandlerFactory,
} from "@buildwithsygma/sygma-contracts"
import { ChainbridgeConfig, EvmBridgeConfig, HandlersMap } from "../sygmaTypes"
import { getProvider } from "../utils/helpers"

import { saveDeposits } from "./saveDeposits"
import { saveProposals } from "./saveProposals"
import { saveFailedHandlerExecutions } from "./saveFailedHandlerExecutions"

export async function indexDeposits(
  bridge: EvmBridgeConfig,
  config: ChainbridgeConfig
) {
  console.log(`\nChecking depostis for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)

  await saveDeposits(
    bridge,
    bridgeContract,
    provider,
    config
  )
}

export async function indexProposals(bridge: EvmBridgeConfig, config: ChainbridgeConfig) {
  console.log(`\nChecking proposals executions for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)

  await saveProposals(bridge, bridgeContract, provider, config)
}

export async function indexFailedHandlerExecutions(bridge: EvmBridgeConfig, config: ChainbridgeConfig) {
  console.log(`Checking failed handler exectutions for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)

  await saveFailedHandlerExecutions(bridge, bridgeContract, provider, config)
}
