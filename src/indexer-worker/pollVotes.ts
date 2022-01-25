import { ethers, Event } from "ethers"

import { PrismaClient } from "@prisma/client"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const prisma = new PrismaClient()

export async function pollVotes(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const proposalVoteFilter = bridgeContract.filters.ProposalVote(null, null, null, null)

  bridgeContract.on(
    proposalVoteFilter,
    async (
      originDomainID: number,
      depositNonce: ethers.BigNumber,
      status: number, // TODO: Confirm wether this is actually being used
      dataHash: string,
      tx: Event,
    ) => {
      const depositNonceInt = depositNonce.toNumber()
      try {
        const eventTransaction = await provider.getTransaction(tx.transactionHash)
        const { from: transactionSenderAddress } = eventTransaction
        console.log("🚀 ~ file: pollVotes.ts ~ line 32 ~ tx", tx)

        await prisma.voteEvent.create({
          data: {
            voteBlockNumber: tx.blockNumber,
            voteTransactionHash: tx.transactionHash,
            dataHash: dataHash,
            timestamp: (await provider.getBlock(tx.blockNumber)).timestamp,
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
    },
  )

  console.log(`Bridge on ${bridge.name} listen for proposal votes`)
}
