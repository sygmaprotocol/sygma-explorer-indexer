/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
//@ts-nocheck
import {
  Bridge__factory as BridgeFactory,
  ERC20Handler__factory as Erc20HandlerFactory,
} from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../sygmaTypes"
import { getProvider } from "../utils/helpers"

import { pollFailedHandlerExecutions } from "./pollFailedHandlerExecutions"
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

  // Failed Handler Executions
  await pollFailedHandlerExecutions(bridge, bridgeContract, provider, config)

  console.log("finish index")
}
