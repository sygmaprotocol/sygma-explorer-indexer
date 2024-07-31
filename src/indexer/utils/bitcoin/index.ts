import FeeRepository from "indexer/repository/fee"
import { sha256 } from "ethers"
import { BigNumber } from "@ethersproject/bignumber"
import { ObjectId } from "mongodb"
import { TransferStatus } from "@prisma/client"
import { RPCClient } from "rpc-bitcoin"
import { BitcoinTypeTransfer, Block, DecodedDeposit, DecodedExecution, Transaction } from "../../../indexer/services/bitcoinIndexer/bitcoinTypes"
import { BitcoinResource, Domain } from "../../../indexer/config"
import AccountRepository from "../../repository/account"
import ExecutionRepository from "../../repository/execution"
import TransferRepository from "../../repository/transfer"
import { logger } from "../../../utils/logger"
import DepositRepository from "../../repository/deposit"
import CoinMarketCapService from "../../../indexer/services/coinmarketcap/coinmarketcap.service"

const WitnessV1Taproot = "witness_v1_taproot"
const OP_RETURN = "nulldata"

export async function saveEvents(
  client: RPCClient,
  block: Block,
  domain: Domain,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
  depositRepository: DepositRepository,
  feeRepository: FeeRepository,
  accountRepository: AccountRepository,
  coinMakerCapService: CoinMarketCapService,
): Promise<void> {
  for (const tx of block.tx) {
    const depositData = decodeDepositEvent(tx, domain)
    if (depositData) {
      const depositNonce = calculateNonce(block.height, tx.hash)
      const senderAddresses = await getSenders(client, tx)
      await saveDeposit(
        tx.txid,
        block.height,
        block.time,
        domain.id,
        depositData,
        depositNonce,
        senderAddresses,
        transferRepository,
        depositRepository,
        accountRepository,
        feeRepository,
        coinMakerCapService,
      )
      continue
    }
    const executionData = decodeExecutionEvent(tx)
    if (executionData) {
      await saveProposalExecution(tx.txid, block.height, block.time, domain.id, executionData, transferRepository, executionRepository)
      continue
    }
  }
}

function decodeDepositEvent(tx: Transaction, domain: Domain): DecodedDeposit | undefined {
  let data = ""
  let amount = BigInt(0)
  let feeAmount = BigInt(0)
  let resource

  for (const vout of tx.vout) {
    // Read OP_RETURN data
    if (vout.scriptPubKey.type == OP_RETURN) {
      // Extract OP_RETURN data (excluding OP_RETURN prefix)
      const opReturnData = Buffer.from(vout.scriptPubKey.hex, "hex")
      data = opReturnData.subarray(2).toString()
    }
    resource = domain.resources.find(resource => resource.address === vout.scriptPubKey.address) as BitcoinResource
    if (resource) {
      if (vout.scriptPubKey.type == WitnessV1Taproot) {
        amount = amount + BigInt(vout.value * 1e8)
      }
      continue
    }
    if (vout.scriptPubKey.address == domain.feeAddress) {
      feeAmount = feeAmount + BigInt(vout.value * 1e8)
    }
  }

  if (!resource || resource.feeAmount == undefined || feeAmount != BigInt(resource.feeAmount)) {
    return undefined
  }

  return {
    resource: resource,
    amount: amount,
    data: data,
    feeAmount: feeAmount,
  }
}

async function saveDeposit(
  txId: string,
  blockNumber: number,
  blockTime: number,
  originDomainId: number,
  decodedDeposit: DecodedDeposit,
  depositNonce: number,
  senderAddresses: string[],
  transferRepository: TransferRepository,
  depositRepository: DepositRepository,
  accountRepository: AccountRepository,
  feeRepository: FeeRepository,
  coinMakerCapService: CoinMarketCapService,
): Promise<void> {
  // Data is in format destinationAddress_destinationDomainID
  const data = decodedDeposit.data.split("_")
  const destinationAddress = data[0]
  const destinationDomainId = parseInt(data[1], 10)

  let amountInUSD
  try {
    amountInUSD = await coinMakerCapService.getValueInUSD(decodedDeposit.amount.toString(), decodedDeposit.resource.symbol)
  } catch (error) {
    logger.error((error as Error).message)
    amountInUSD = 0
  }

  for (const sender of senderAddresses) {
    await accountRepository.insertAccount({
      id: new ObjectId().toString(),
      address: sender,
      addressStatus: "",
      transferIds: [],
    })
  }
  let transfer = await transferRepository.findTransfer(Number(depositNonce), originDomainId, destinationDomainId)

  if (transfer) {
    await transferRepository.updateTransfer(
      {
        amount: decodedDeposit.amount.toString(),
        depositNonce: depositNonce,
        destination: destinationAddress,
        fromDomainId: originDomainId.toString(),
        resourceID: decodedDeposit.resource.resourceId,
        sender: senderAddresses,
        toDomainId: destinationDomainId.toString(),
        usdValue: amountInUSD,
      },
      transfer.id,
    )
  } else {
    transfer = await transferRepository.insertDepositTransfer({
      amount: decodedDeposit.amount.toString(),
      depositNonce: depositNonce,
      destination: destinationAddress,
      fromDomainId: originDomainId.toString(),
      resourceID: decodedDeposit.resource.symbol,
      sender: senderAddresses,
      toDomainId: destinationDomainId.toString(),
      usdValue: amountInUSD,
    })
  }

  const deposit = {
    id: new ObjectId().toString(),
    type: BitcoinTypeTransfer.Fungible,
    txHash: txId,
    blockNumber: blockNumber.toString(),
    depositData: "",
    timestamp: new Date(blockTime),
    handlerResponse: "",
    transferId: transfer.id,
  }
  await depositRepository.insertDeposit(deposit)

  const feeData = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    tokenSymbol: decodedDeposit.resource.symbol,
    decimals: decodedDeposit.resource.decimals,
    tokenAddress: decodedDeposit.resource.address,
    amount: decodedDeposit.feeAmount.toString(),
  }
  await feeRepository.insertFee(feeData)
}

function decodeExecutionEvent(tx: Transaction): DecodedExecution | undefined {
  let metadata: DecodedExecution | undefined

  for (const vout of tx.vout) {
    if (vout.scriptPubKey.type == OP_RETURN) {
      const opReturnData = Buffer.from(vout.scriptPubKey.hex, "hex")
      const data = opReturnData.subarray(2).toString()

      // Data is in format syg_<hash>
      const dataElems = data.split("_")
      if (dataElems[0] != "syg") {
        continue
      }
      //metadata = fetchMetadata(dataElems[1])
    }
  }
  return metadata
}

async function saveProposalExecution(
  txId: string,
  blockNumber: number,
  blockTime: number,
  destinationDomainId: number,
  executionData: DecodedExecution,
  transferRepository: TransferRepository,
  executionRepository: ExecutionRepository,
): Promise<void> {
  let transfer = await transferRepository.findTransfer(Number(executionData.depositNonce), executionData.originDomainId, destinationDomainId)

  if (!transfer) {
    transfer = await transferRepository.insertExecutionTransfer(
      {
        depositNonce: Number(executionData.depositNonce),
        fromDomainId: executionData.originDomainId.toString(),
      },
      destinationDomainId,
    )
  } else {
    await transferRepository.updateStatus(TransferStatus.executed, transfer.id, "")
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    txHash: txId,
    timestamp: new Date(blockTime),
    blockNumber: blockNumber.toString(),
  }
  await executionRepository.upsertExecution(execution)
}

function calculateNonce(blockHeight: number, txHash: string): number {
  // Concatenate blockHeight string and transactionHash with a separator
  const concatString = blockHeight.toString() + "-" + txHash

  // Calculate SHA-256 hash of the concatenated string
  const hashString = sha256(Buffer.from(concatString))
  const hashBytes = Buffer.from(hashString)

  // XOR fold the hash
  let result = BigInt(0)
  for (let i = 0; i < 4; i++) {
    const part = BigNumber.from(hashBytes.slice(i * 8, (i + 1) * 8))
    result ^= part.toBigInt()
  }
  return Number(result)
}

async function getSenders(client: RPCClient, tx: Transaction): Promise<string[]> {
  const senderAddresses: string[] = []
  for (const vin of tx.vin) {
    const senderTx = (await client.getrawtransaction({ txid: vin.txid, verbose: true })) as Transaction
    senderAddresses.push(senderTx.vout[vin.vout].scriptPubKey.address)
  }
  return senderAddresses
}
