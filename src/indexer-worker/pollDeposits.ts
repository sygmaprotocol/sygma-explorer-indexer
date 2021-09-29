import { ethers, Event } from "ethers"

import { PrismaClient } from "@prisma/client"
import { getNetworkName } from "../utils/helpers"
import { Bridge, Erc20Handler } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"
import { getDestinationTokenAddress } from "../utils/getDestinationTokenAddress"

const prisma = new PrismaClient()

export async function pollDeposits(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  erc20HandlerContract: Erc20Handler,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig
) {
  const depositFilter = bridgeContract.filters.Deposit(null, null, null)
  bridgeContract.on(
    depositFilter,
    async(
      destChainId: number,
      resourceId: string,
      depositNonce: ethers.BigNumber,
      tx: Event
    ) => {
      const depositRecord = await erc20HandlerContract.getDepositRecord(
        depositNonce,
        destChainId
      )
      console.log("🚀 ~ file: pollDeposits.ts ~ line 30 ~ depositRecord", depositRecord)
      console.time(`Nonce: ${depositNonce}`)
      const destinationTokenAddress = await getDestinationTokenAddress(depositRecord._resourceID, depositRecord._destinationChainID, config)
      await prisma.transfer.upsert({
        where: {
          depositNonce: depositNonce.toNumber(),
        },
        create: {
          depositNonce: depositNonce.toNumber(),
          fromAddress: depositRecord._depositer,
          depositBlockNumber: tx.blockNumber,
          depositTransactionHash: tx.transactionHash,
          fromChainId: bridge.chainId,
          fromNetworkName: bridge.name,
          timestamp: (await provider.getBlock(tx.blockNumber)).timestamp,
          toChainId: destChainId,
          toNetworkName: getNetworkName(destChainId, config),
          toAddress: depositRecord._destinationRecipientAddress,
          tokenAddress: depositRecord._tokenAddress,
          sourceTokenAddress: depositRecord._tokenAddress,
          destinationTokenAddress: destinationTokenAddress,
          amount: depositRecord._amount.toString(),
          resourceId: resourceId,
        },
        update: {
          depositNonce: depositNonce.toNumber(),
          fromAddress: depositRecord._depositer,
          depositBlockNumber: tx.blockNumber,
          depositTransactionHash: tx.transactionHash,
          fromChainId: bridge.chainId,
          fromNetworkName: bridge.name,
          timestamp: (await provider.getBlock(tx.blockNumber)).timestamp,
          toChainId: destChainId,
          toNetworkName: getNetworkName(destChainId, config),
          toAddress: depositRecord._destinationRecipientAddress,
          tokenAddress: depositRecord._tokenAddress,
          sourceTokenAddress: depositRecord._tokenAddress,
          destinationTokenAddress: destinationTokenAddress,
          amount: depositRecord._amount.toString(),
          resourceId: resourceId,
        },
      })
      console.timeEnd(`Nonce: ${depositNonce}`)
    }
  )

  console.log(`Bridge on ${bridge.name} listen for deposits`)
}
