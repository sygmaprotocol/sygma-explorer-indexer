import { ethers } from "ethers"

import { PrismaClient } from "@prisma/client"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const prisma = new PrismaClient()

export async function saveProposals(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const proposalEventFilter = bridgeContract.filters.ProposalEvent(null, null, null, null)
  const proposalEventLogs = await provider.getLogs({
    ...proposalEventFilter,
    fromBlock: bridge.deployedBlockNumber,
  })
  for (const pel of proposalEventLogs) {
    const tx = await provider.getTransaction(pel.transactionHash)
    const { from: transactionSenderAddress } = tx
    const parsedLog = bridgeContract.interface.parseLog(pel)
    const { depositNonce, status, dataHash } = parsedLog.args
    const depositNonceInt = depositNonce.toNumber()
    try {
      await prisma.proposalEvent.create({
        data: {
          proposalEventBlockNumber: pel.blockNumber,
          proposalEventTransactionHash: pel.transactionHash,
          dataHash: dataHash,
          timestamp: (await provider.getBlock(pel.blockNumber)).timestamp,
          proposalStatus: status,
          by: transactionSenderAddress,
          transfer: {
            connect: {
              depositNonce: depositNonceInt,
            },
          },
        },
      })
    } catch (error) {
      console.error(error)
      console.error("DepositNonce", depositNonceInt)
    }
  }
  console.log(`Added ${bridge.name} ${proposalEventLogs.length} proposal events`)
}
