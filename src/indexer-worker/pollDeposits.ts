import { ethers, Event } from "ethers"
import NodeCache from "node-cache"

import { PrismaClient } from "@prisma/client"
import { getNetworkName, decodeDataHash } from "../utils/helpers"
import { Bridge, Erc20Handler } from "@chainsafe/chainbridge-contracts"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"
import { getDestinationTokenAddress } from "../utils/getDestinationTokenAddress"

const prisma = new PrismaClient()
const cache = new NodeCache({ stdTTL: 15 })

export async function pollDeposits(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  erc20HandlerContract: Erc20Handler,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig,
) {
  const depositFilter = bridgeContract.filters.Deposit(null, null, null)
  bridgeContract.on(
    depositFilter,
    async (
      destinationDomainID: number,
      resourceID: string,
      depositNonce: ethers.BigNumber,
      user: string,
      data: string,
      handlerResponse: string,
      tx: Event,
    ) => {
      let dataTransfer
      const depositNonceInt = depositNonce.toNumber()
      try {
        const { destinationRecipientAddress, amount } = decodeDataHash(data, bridge.decimals)

        console.time(`Nonce: ${depositNonce}`)
        const cacheTokenKey = `resourceIDToTokenContractAddress_${resourceID}_${bridge.domainId}`

        let tokenAddress
        if (cache.has(cacheTokenKey)) {
          tokenAddress = cache.get(cacheTokenKey)
        } else {
          tokenAddress = await erc20HandlerContract._resourceIDToTokenContractAddress(resourceID)
          cache.set(cacheTokenKey, tokenAddress)
        }
        let destinationTokenAddress
        if (cache.has(`${resourceID}-${destinationDomainID}`)) {
          destinationTokenAddress = cache.get(`${resourceID}-${destinationDomainID}`)
        } else {
          destinationTokenAddress = await getDestinationTokenAddress(resourceID, destinationDomainID, config)
          cache.set(`${resourceID}-${destinationDomainID}`, destinationTokenAddress)
        }
        dataTransfer = {
          depositNonce: depositNonceInt,
          fromAddress: user,
          depositBlockNumber: tx.blockNumber,
          depositTransactionHash: tx.transactionHash,
          fromDomainId: bridge.domainId,
          fromNetworkName: bridge.name,
          timestamp: (await provider.getBlock(tx.blockNumber)).timestamp,
          toDomainId: destinationDomainID,
          toNetworkName: getNetworkName(destinationDomainID, config),
          toAddress: destinationRecipientAddress,
          tokenAddress: tokenAddress,
          sourceTokenAddress: tokenAddress,
          destinationTokenAddress: destinationTokenAddress,
          amount: amount,
          resourceId: resourceID,
        }
        console.log("🚀 ~ file: pollDeposits.ts ~ line 53 ~ dataTransfer", dataTransfer)
        await prisma.transfer.upsert({
          where: {
            depositNonce: depositNonceInt,
          },
          create: dataTransfer,
          update: dataTransfer,
        })
      } catch (error) {
        console.error(error)
        console.error("DepositNonce", depositNonceInt)
        console.error("dataTransfer", dataTransfer)
      }
      console.timeEnd(`Nonce: ${depositNonce}`)
    },
  )

  console.log(`Bridge on ${bridge.name} listen for deposits`)
}
