import {
  BridgeFactory,
  Erc20HandlerFactory,
} from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"
import { getProvider } from "../utils/helpers"

import { pollVotes } from "./pollVotes"
import { pollProposals } from "./pollProposals"
import { pollDeposits } from "./pollDeposits"

export async function indexer(
  bridge: EvmBridgeConfig,
  config: ChainbridgeConfig
) {
  console.log(`Checking events for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)
  const erc20HandlerContract = Erc20HandlerFactory.connect(
    bridge.erc20HandlerAddress,
    provider
  )

  // TRANSFERS
  await pollDeposits(
    bridge,
    bridgeContract,
    erc20HandlerContract,
    provider,
    config
  )

  // PROPOSALS
  await pollProposals(bridge, bridgeContract, provider, config)

  // VOTE_EVENTS
  await pollVotes(bridge, bridgeContract, provider, config)

  console.log("finish index")
}
