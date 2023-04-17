import { ethers } from "ethers"

import NodeCache from "node-cache"

import { PrismaClient } from "@prisma/client"
import { getNetworkName, decodeDataHash, getHandlersMap } from "../utils/helpers"
import { Bridge, ERC20Handler } from "@buildwithsygma/sygma-contracts"
import { ChainbridgeConfig, EvmBridgeConfig, HandlersMap } from "../sygmaTypes"
import { getDestinationTokenAddress } from "../utils/getDestinationTokenAddress"
import {Domain} from "../cfg/types";

const prisma = new PrismaClient()
const cache = new NodeCache({ stdTTL: 15 })

export async function saveDeposits(
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: Domain,
  fromBlock: string,
  toBlock: string
) {
  const depositFilter = bridgeContract.filters.Deposit(null, null, null, null, null, null)
  const depositLogs = await provider.getLogs({
    ...depositFilter,
    fromBlock: fromBlock,
    toBlock: toBlock
  })
  const handlersMap = getHandlersMap(config, provider)
  for (const dl of depositLogs) {
    const parsedLog = bridgeContract.interface.parseLog(dl)
    const { destinationDomainID, resourceID, depositNonce, user, data, handlerResponse } = parsedLog.args
    const depositNonceInt = depositNonce.toNumber()
    // TODO - HARDCODED 18
    const { destinationRecipientAddress, amount } = decodeDataHash(data, 18)
    console.time(`Nonce: ${depositNonce}`)

    let dataTransfer
    try {
      let tokenAddress
      const cacheTokenKey = `resourceIDToTokenContractAddress_${resourceID}_${bridge.domainId}`
      if (cache.has(cacheTokenKey)) {
        tokenAddress = cache.get(cacheTokenKey) as String
      } else {
        const handlerAddress = await bridgeContract._resourceIDToHandlerAddress(resourceID)
        tokenAddress = await handlersMap[handlerAddress]._resourceIDToTokenContractAddress(resourceID)
        cache.set(cacheTokenKey, tokenAddress)
      }
      let destinationTokenAddress
      if (cache.has(`${resourceID}-${destinationDomainID}`)) {
        destinationTokenAddress = cache.get(`${resourceID}-${destinationDomainID}`) as String
      } else {
        destinationTokenAddress = await getDestinationTokenAddress(resourceID, destinationDomainID, config)
        cache.set(`${resourceID}-${destinationDomainID}`, destinationTokenAddress)
      }
      dataTransfer = {
        depositNonce: depositNonceInt,
        fromAddress: user.toLocaleLowerCase(),
        depositBlockNumber: dl.blockNumber,
        depositTransactionHash: dl.transactionHash,
        fromDomainId: bridge.domainId,
        fromNetworkName: bridge.name,
        timestamp: (await provider.getBlock(dl.blockNumber)).timestamp,
        toDomainId: destinationDomainID,
        toNetworkName: getNetworkName(destinationDomainID, config),
        toAddress: destinationRecipientAddress.toLocaleLowerCase(),
        sourceTokenAddress: tokenAddress.toLocaleLowerCase(),
        destinationTokenAddress: destinationTokenAddress.toLocaleLowerCase(),
        amount: amount,
        resourceId: resourceID,
        handlerResponse: handlerResponse
      }
      await prisma.transfer.upsert({
        where: {
          depositNonce: depositNonceInt
        },
        create: dataTransfer,
        update: dataTransfer,
      })
    } catch (error) {
      console.error(error)
      console.error("DepositNonce", depositNonceInt)
      console.error("dataTransfer", dataTransfer)
    }
    console.timeEnd(`Nonce: ${parsedLog.args.depositNonce}`)
  };
  console.log(`Added ${bridge.name} \x1b[33m${depositLogs.length}\x1b[0m deposits`)
}
