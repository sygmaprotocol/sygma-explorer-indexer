import { ethers } from "ethers"

import { PrismaClient } from "@prisma/client"
import { getNetworkName } from "../utils/helpers"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const prisma = new PrismaClient()

export async function saveProposals(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig
) {
  const proposalEventFilter = bridgeContract.filters.ProposalEvent(
    null,
    null,
    null,
    null,
    null
  )
  const proposalEventLogs = await provider.getLogs({
    ...proposalEventFilter,
    fromBlock: bridge.deployedBlockNumber,
  })
  for (const pel of proposalEventLogs) {
    const tx = await provider.getTransaction(pel.transactionHash)
    const transactionSenderAddress = tx.from
    const parsedLog = bridgeContract.interface.parseLog(pel)

    await prisma.proposal.create({
      data: {
        proposalEventBlockNumber: pel.blockNumber,
        proposalEventTransactionHash: pel.transactionHash,
        dataHash: parsedLog.args.dataHash,
        timestamp: (await provider.getBlock(pel.blockNumber))
          .timestamp,
        proposalStatus: parsedLog.args.status,
        by: transactionSenderAddress,
        transfer: {
          connectOrCreate: {
            where: {
              depositNonce: parsedLog.args.depositNonce.toNumber()
            },
            create: {
              depositNonce: parsedLog.args.depositNonce.toNumber(),
              resourceId: parsedLog.args.resourceID,
              fromChainId: parsedLog.args.originChainID,
              fromNetworkName: getNetworkName(parsedLog.args.originChainID, config),
              toChainId: bridge.chainId,
              toNetworkName: bridge.name
            }
          }
        }
      }
    })
  };
  console.log(
    `Added ${bridge.name} ${proposalEventLogs.length} proposal events`
  )
}
