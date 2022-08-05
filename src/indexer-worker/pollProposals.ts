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
  const proposalExecutionEventFilter = bridgeContract.filters.ProposalExecution(null, null, null)

  bridgeContract.on(proposalExecutionEventFilter, async(originDomainID: number, depositNonce: ethers.BigNumber, data: string, tx: Event) => {
    const depositNonceInt = depositNonce.toNumber()
    try {
      const eventTransaction = await provider.getTransaction(tx.transactionHash)
      const { from: transactionSenderAddress } = eventTransaction
      console.log("🚀 ~ file: pollProposals.ts ~ line 34 ~ tx", tx)

      await prisma.transfer.update({
        where: {
          depositNonce: depositNonceInt,
        },
        data: {
          proposalExecutionEvent: {
            set: {
              originDomainID: originDomainID,
              depositNonce: depositNonceInt,
              data: data,
              by: transactionSenderAddress
            },
          },
        },
      })
    } catch (error) {
      console.error(error)
      console.error("DepositNonce", depositNonceInt)
    }
  })

  console.log(`Bridge on ${bridge.name} listen for proposal events`)
}
