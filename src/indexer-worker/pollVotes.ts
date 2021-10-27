import { ethers, Event } from "ethers"

import { PrismaClient } from "@prisma/client"
import { getNetworkName } from "../utils/helpers"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const prisma = new PrismaClient()

export async function pollVotes(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig
) {
  const proposalVoteFilter = bridgeContract.filters.ProposalVote(
    null,
    null,
    null,
    null
  )

  bridgeContract.on(
    proposalVoteFilter,
    async(
      originDomainId: number,
      depositNonce: ethers.BigNumber,
      status: number, // TODO: Confirm wether this is actually being used
      resourceId: string,
      tx: Event
    ) => {
      const eventTransaction = await provider.getTransaction(tx.transactionHash)
      const { from: transactionSenderAddress } = eventTransaction
      console.log("🚀 ~ file: pollVotes.ts ~ line 32 ~ tx", tx)
      await prisma.voteEvent.create({
        data: {
          voteBlockNumber: tx.blockNumber,
          voteTransactionHash: tx.transactionHash,
          dataHash: "", // TODO: Confirm whether this is available
          timestamp: (await provider.getBlock(tx.blockNumber)).timestamp,
          voteStatus: Boolean(status),
          by: transactionSenderAddress,
          transfer: {
            connectOrCreate: {
              where: {
                depositNonce: depositNonce.toNumber(),
              },
              create: {
                depositNonce: depositNonce.toNumber(),
                resourceId: resourceId,
                fromDomainId: originDomainId,
                fromNetworkName: getNetworkName(
                  originDomainId,
                  config
                ),
                toDomainId: bridge.domainId,
                toNetworkName: bridge.name,
              },
            },
          },
        },
      })
    })

  console.log(
    `Bridge on ${bridge.name} listen for proposal votes`
  )
}
