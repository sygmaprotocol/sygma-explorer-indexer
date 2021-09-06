import {
  BridgeFactory,
  Erc20HandlerFactory,
} from "@chainsafe/chainbridge-contracts";
import {ChainbridgeConfig, EvmBridgeConfig} from "./chainbridgeTypes"
import { PrismaClient } from '@prisma/client'
import { getProvider } from "../utils/helpers";

import { saveVotes } from "./saveVotes"
import { saveProposals } from "./saveProposals"
import { saveDeposits } from "./saveDeposits"

const prisma = new PrismaClient()

export async function indexer(bridge: EvmBridgeConfig, config: ChainbridgeConfig) {
  console.log(`Checking events for ${bridge.name}`);

  const provider = getProvider(bridge)
  await provider.ready
  
  const bridgeContract = BridgeFactory.connect(bridge.bridgeAddress, provider);
  const erc20HandlerContract = Erc20HandlerFactory.connect(
    bridge.erc20HandlerAddress,
    provider
  );

  // TRANSFERS
  await saveDeposits(bridge, bridgeContract, erc20HandlerContract, provider, config)
  
  // PROPOSALS
  await saveProposals(bridge, bridgeContract, provider, config)

  // VOTE_EVENTS
  await saveVotes(bridge, bridgeContract, provider, config)

  console.log('finish index')
}

