//@ts-nocheck
import { ethers } from "ethers"

import NodeCache from "node-cache"

import { PrismaClient, Deposit } from "@prisma/client"
import { getNetworkName, decodeDataHash, getEVMHandlersMap } from "../utils/helpers"
import { Bridge, ERC20Handler } from "@buildwithsygma/sygma-contracts"
import { getDestinationTokenAddress } from "../utils/getDestinationTokenAddress"
import { EthereumSharedConfigDomain, SharedConfigFormated } from "types"

const prisma = new PrismaClient()
const cache = new NodeCache({ stdTTL: 15 })

export async function saveEvmDeposits({
  domain,
  bridgeContract,
  provider,
  mapResourceIdToTypeOfResource,
  sygmaConfig
} : {
  domain: EthereumSharedConfigDomain,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  mapResourceIdToTypeOfResource: Array<{ resourceId: string, type: string }>
  sygmaConfig: SharedConfigFormated[]
}
) {
  const depositFilter = bridgeContract.filters.Deposit(null, null, null, null, null, null)
  const depositLogs = await provider.getLogs({
    ...depositFilter,
    fromBlock: domain.startBlock,
    toBlock: domain.latestBlockNumber ?? "latest"
  })

  for (const dl of depositLogs) {
    const parsedLog = bridgeContract.interface.parseLog(dl)

    const { args: { depositNonce, data, handlerResponse }} = parsedLog;

    const depositNonceInt = depositNonce.toNumber()

    let deposit
    try {
      //note:  this needs to be adjusted 100% to Deposit schema
      deposit = {
        txHash: dl.transactionHash,
        blockNumber: `${dl.blockNumber}`,
        depositData: data,
        handlerResponse: handlerResponse,
      } as Deposit

      await prisma.deposit.create({
        data: { ...deposit }
      })

    } catch (error) {
      console.error(error)
      console.error("DepositNonce", depositNonceInt)
      console.error("dataTransfer", deposit)
    }
    console.timeEnd(`Nonce: ${parsedLog.args.depositNonce}`)
  };
  console.log(`Added ${domain.name} \x1b[33m${depositLogs.length}\x1b[0m deposits`)
}
