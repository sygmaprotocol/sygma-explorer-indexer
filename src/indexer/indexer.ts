import {
  BridgeFactory,
  Erc20HandlerFactory,
} from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"
import { getProvider } from "../utils/helpers"

import { saveVotes } from "./saveVotes"
import { saveProposals } from "./saveProposals"
import { saveDeposits } from "./saveDeposits"

export async function indexDeposits(
  bridge: EvmBridgeConfig,
  config: ChainbridgeConfig
) {
  console.log(`Checking depostis for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)
  const erc20HandlerContract = Erc20HandlerFactory.connect(
    bridge.erc20HandlerAddress,
    provider
  )

  // TRANSFERS
  await saveDeposits(
    bridge,
    bridgeContract,
    erc20HandlerContract,
    provider,
    config
  )

  // // PROPOSALS
  // await saveProposals(bridge, bridgeContract, provider, config)

  // // VOTE_EVENTS
  // await saveVotes(bridge, bridgeContract, provider, config)
}
export async function indexProposals(bridge: EvmBridgeConfig, config: ChainbridgeConfig) {
  console.log(`Checking proposals for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)
  // PROPOSALS
  await saveProposals(bridge, bridgeContract, provider, config)
}

export async function indexVotes(bridge: EvmBridgeConfig, config: ChainbridgeConfig) {
  console.log(`Checking votes for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)
  // VOTE_EVENTS
  await saveVotes(bridge, bridgeContract, provider, config)
}
