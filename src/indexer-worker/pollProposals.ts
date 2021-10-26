import { ethers, Event } from "ethers"

import { PrismaClient } from "@prisma/client"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const prisma = new PrismaClient()

export async function pollProposals(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const proposalEventFilter = bridgeContract.filters.ProposalEvent(null, null, null, null, null)

  bridgeContract.on(
    proposalEventFilter,
    async(originDomainID: number, depositNonce: ethers.BigNumber, status: number, dataHash: string, tx: Event) => {
      const depositNonceInt = depositNonce.toNumber()
      const eventTransaction = await provider.getTransaction(tx.transactionHash)
      const { from: transactionSenderAddress } = eventTransaction
      console.log("🚀 ~ file: pollProposals.ts ~ line 34 ~ tx", tx)
      try {
        await prisma.proposalEvent.create({
          data: {
            proposalEventBlockNumber: tx.blockNumber,
            proposalEventTransactionHash: tx.transactionHash,
            dataHash: dataHash,
            timestamp: (await provider.getBlock(tx.blockNumber)).timestamp,
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
    },
  )

  console.log(`Bridge on ${bridge.name} listen for proposal events`)
}
