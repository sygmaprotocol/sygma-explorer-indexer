/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
// @ts-nocheck
import {
  Bridge__factory as BridgeFactory,
  ERC20Handler__factory as Erc20HandlerFactory,
  ERC721Handler__factory as Erc721HandlerFactory,
} from "@chainsafe/chainbridge-contracts"
import { SygmaConfig, EvmBridgeConfig, HandlersMap } from "../sygmaTypes"
import { getProvider } from "../utils/helpers"

import { saveDeposits } from "./saveDeposits"
import { saveProposals } from "./saveProposals"
import { saveFailedHandlerExecutions } from "./saveFailedHandlerExecutions"
import { Config, IndexerSharedConfig } from "types"

export async function indexDeposits(
  bridge: Config,
  config: IndexerSharedConfig
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

export async function indexProposals(bridge: Config, config: SygmaConfig) {
  console.log(`\nChecking proposals executions for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)

  await saveProposals(bridge, bridgeContract, provider, config)
}

export async function indexFailedHandlerExecutions(bridge: EvmBridgeConfig, config: SygmaConfig) {
  console.log(`Checking failed handler exectutions for ${bridge.name}`)

  const provider = getProvider(bridge)
  await provider.ready

  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider)

  await saveFailedHandlerExecutions(bridge, bridgeContract, provider, config)
}
