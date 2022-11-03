import { ethers, Event } from "ethers"

import { PrismaClient } from "@prisma/client"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../sygmaTypes"

const prisma = new PrismaClient()

export async function pollFailedHandlerExecutions(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const failedHandlerExecutionFilter = bridgeContract.filters.FailedHandlerExecution(null, null, null)

  bridgeContract.on(
    failedHandlerExecutionFilter,
    async(
      lowLevelData: string,
      originDomainID: number,
      depositNonce: ethers.BigNumber,
      tx: Event,
    ) => {
      const depositNonceInt = depositNonce.toNumber()
      try {
        const eventTransaction = await provider.getTransaction(tx.transactionHash)
        const { from: transactionSenderAddress } = eventTransaction
        console.log("🚀 ~ file: pollVotes.ts ~ line 32 ~ tx", tx)

        await prisma.transfer.update({
          where: {
            depositNonce: depositNonceInt,
          },
          data: {
            failedHandlerExecutionEvent: {
              set: {
                lowLevelData: lowLevelData,
                originDomainID: originDomainID,
                depositNonce: depositNonceInt,
                by: transactionSenderAddress
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

  console.log(`Bridge on ${bridge.name} listen for  failed handler execution`)
}
