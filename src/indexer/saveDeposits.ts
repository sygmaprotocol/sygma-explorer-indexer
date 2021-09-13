import { ethers } from "ethers"

import { PrismaClient } from "@prisma/client"
import { getNetworkName } from "../utils/helpers"
import { Bridge, Erc20Handler } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"

const prisma = new PrismaClient()

export async function saveDeposits(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  erc20HandlerContract: Erc20Handler,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig
) {
  const depositFilter = bridgeContract.filters.Deposit(null, null, null)
  const depositLogs = await provider.getLogs({
    ...depositFilter,
    fromBlock: bridge.deployedBlockNumber,
  })
  for (const dl of depositLogs) {
    const parsedLog = bridgeContract.interface.parseLog(dl)
    console.time(`Nonce: ${parsedLog.args.depositNonce}`)

    const depositRecord = await erc20HandlerContract.getDepositRecord(
      parsedLog.args.depositNonce,
      parsedLog.args.destinationChainID
    )
    await prisma.transfer.upsert({
      where: {
        depositNonce: parsedLog.args.depositNonce.toNumber(),
      },
      create: {
        depositNonce: parsedLog.args.depositNonce.toNumber(),
        fromAddress: depositRecord._depositer,
        depositBlockNumber: dl.blockNumber,
        depositTransactionHash: dl.transactionHash,
        fromChainId: bridge.chainId,
        fromNetworkName: bridge.name,
        timestamp: (await provider.getBlock(dl.blockNumber)).timestamp,
        toChainId: parsedLog.args.destinationChainID,
        toNetworkName: getNetworkName(parsedLog.args.destinationChainID, config),
        toAddress: depositRecord._destinationRecipientAddress,
        tokenAddress: depositRecord._tokenAddress,
        amount: BigInt(depositRecord._amount.toString()),
        resourceId: parsedLog.args.resourceID,
      },
      update: {
        depositNonce: parsedLog.args.depositNonce.toNumber(),
        fromAddress: depositRecord._depositer,
        depositBlockNumber: dl.blockNumber,
        depositTransactionHash: dl.transactionHash,
        fromChainId: bridge.chainId,
        fromNetworkName: bridge.name,
        timestamp: (await provider.getBlock(dl.blockNumber)).timestamp,
        toChainId: parsedLog.args.destinationChainID,
        toNetworkName: getNetworkName(parsedLog.args.destinationChainID, config),
        toAddress: depositRecord._destinationRecipientAddress,
        tokenAddress: depositRecord._tokenAddress,
        amount: BigInt(depositRecord._amount.toString()),
        resourceId: parsedLog.args.resourceID,
      },
    })
    console.timeEnd(`Nonce: ${parsedLog.args.depositNonce}`)
  };
  console.log(`Added ${bridge.name} ${depositLogs.length} deposits`)
}
