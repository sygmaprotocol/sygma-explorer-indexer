import { ethers } from "ethers"

import { PrismaClient } from "@prisma/client"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../sygmaTypes"

const prisma = new PrismaClient()

export async function saveFailedHandlerExecutions(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const failedHandlerExecutionFilter = bridgeContract.filters.FailedHandlerExecution(null, null, null)

  const failedHandlerExecutionLogs = await provider.getLogs({
    ...failedHandlerExecutionFilter,
    fromBlock: bridge.deployedBlockNumber,
    toBlock: bridge.latestBlockNumber ?? "latest"
  })
  for (const pvl of failedHandlerExecutionLogs) {
    let depositNonceInt
    try {
      const tx = await provider.getTransaction(pvl.transactionHash)
      const { from: transactionSenderAddress } = tx
      const parsedLog = bridgeContract.interface.parseLog(pvl)

      const { lowLevelData, originDomainID, depositNonce } = parsedLog.args
      depositNonceInt = depositNonce.toNumber()

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
  }
  console.log(`Added ${bridge.name} \x1b[33m${failedHandlerExecutionLogs.length}\x1b[0m failed handler executions`)
}
