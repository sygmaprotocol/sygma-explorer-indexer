import { ethers } from "ethers"

import { PrismaClient } from "@prisma/client"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const prisma = new PrismaClient()

export async function saveVotes(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const proposalVoteFilter = bridgeContract.filters.ProposalVote(null, null, null, null)

  const proposalVoteLogs = await provider.getLogs({
    ...proposalVoteFilter,
    fromBlock: bridge.deployedBlockNumber,
  })
  for (const pvl of proposalVoteLogs) {
    let depositNonceInt
    try {
      const tx = await provider.getTransaction(pvl.transactionHash)
      const { from: transactionSenderAddress } = tx
      const parsedLog = bridgeContract.interface.parseLog(pvl)

      const { depositNonce, status, dataHash } = parsedLog.args
      depositNonceInt = depositNonce.toNumber()

      await prisma.voteEvent.create({
        data: {
          voteBlockNumber: pvl.blockNumber,
          voteTransactionHash: pvl.transactionHash,
          dataHash: dataHash,
          timestamp: (await provider.getBlock(pvl.blockNumber)).timestamp,
          voteStatus: Boolean(status),
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
  console.log(`Added ${bridge.name} ${proposalVoteLogs.length} proposal votes`)
}
