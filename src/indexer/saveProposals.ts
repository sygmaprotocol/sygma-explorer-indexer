/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
//@ts-nocheck
import { ethers } from "ethers"

import { PrismaClient } from "@prisma/client"
import { Bridge } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../sygmaTypes"

const prisma = new PrismaClient()

export async function saveProposals(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const proposalEventFilter = bridgeContract.filters.ProposalExecution(null, null, null)
  const proposalEventLogs = await provider.getLogs({
    ...proposalEventFilter,
    fromBlock: bridge.deployedBlockNumber,
    toBlock: bridge.latestBlockNumber ?? "latest"
  })
  for (const pel of proposalEventLogs) {
    let depositNonceInt
    try {
      const tx = await provider.getTransaction(pel.transactionHash)
      const { from: transactionSenderAddress } = tx
      const parsedLog = bridgeContract.interface.parseLog(pel)
      const { depositNonce, originDomainID, dataHash } = parsedLog.args
      depositNonceInt = depositNonce.toNumber()

      await prisma.transfer.update({
        where: {
          depositNonce: depositNonceInt,
        },
        data: {
          proposalExecutionEvent: {
            set: {
              originDomainID: originDomainID,
              depositNonce: depositNonceInt,
              dataHash: dataHash,
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
  console.log(`Added ${bridge.name} \x1b[33m${proposalEventLogs.length}\x1b[0m proposal events`)
}
