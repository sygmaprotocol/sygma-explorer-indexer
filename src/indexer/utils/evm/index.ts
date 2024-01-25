/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { BytesLike, Log, LogDescription, Provider, TransactionReceipt, getBytes, AbiCoder, formatUnits, BigNumberish, ethers } from "ethers"
import { ObjectId } from "mongodb"
import { TransferStatus } from "@prisma/client"
import { MultiLocation } from "@polkadot/types/interfaces"
import { ApiPromise, WsProvider } from "@polkadot/api"
import AccountRepository from "../../repository/account"
import TransferRepository from "../../repository/transfer"
import DepositRepository from "../../repository/deposit"
import { logger } from "../../../utils/logger"
import { Domain, DomainTypes, EvmResource, ResourceTypes, SharedConfig, getSsmDomainConfig } from "../../config"
import {
  DecodedDepositLog,
  DecodedFailedHandlerExecution,
  FeeData,
  DecodedLogs,
  DecodedProposalExecutionLog,
  DepositType,
  EventType,
  FeeHandlerType,
} from "../../services/evmIndexer/evmTypes"
import { getBasicFeeContract, getBridgeContract, getERC20Contract, getPercentageFeeContract, gerFeeRouterContract } from "../../services/contract"
import FeeRepository from "../../repository/fee"
import ExecutionRepository from "../../repository/execution"
import { OfacComplianceService } from "../../services/ofac"
import CoinMarketCapService from "../../services/coinmarketcap/coinmarketcap.service"

export const nativeTokenAddress = "0x0000000000000000000000000000000000000000"
type Junction = {
  accountId32?: {
    id: string
  }
}
type FeeDataResponse = {
  fee: string
  tokenAddress: string
}
export async function getDecodedLogs(
  log: Log,
  provider: Provider,
  fromDomain: Domain,
  resourceMap: Map<string, EvmResource>,
  decodedLogs: DecodedLogs,
  domains: Domain[],
): Promise<void> {
  const blockUnixTimestamp = (await provider.getBlock(log.blockNumber))?.timestamp || 0
  const contractData = fromDomain.feeHandlers.filter(handler => handler.address == log.address)

  let decodedLog: LogDescription | null = null
  if (contractData[0]?.type == FeeHandlerType.BASIC) {
    const contract = getBasicFeeContract(provider, contractData[0].address)
    decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
  } else if (contractData[0]?.type == FeeHandlerType.PERCENTAGE) {
    const contract = getPercentageFeeContract(provider, contractData[0].address)
    decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
  } else if (fromDomain.bridge.toLowerCase() == log.address.toLowerCase()) {
    const contract = getBridgeContract(provider, fromDomain.bridge)
    decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
  }

  if (!decodedLog) {
    throw new Error(`No decoded log for ${fromDomain.id}} and ${log.address}`)
  }

  const txReceipt = await provider.getTransactionReceipt(log.transactionHash)
  if (!txReceipt) {
    logger.warn("No txReceipt")
    return
  }
  switch (decodedLog.name) {
    case EventType.DEPOSIT: {
      const toDomain = domains.filter(domain => domain.id == decodedLog?.args.destinationDomainID)
      const deposit = await parseDeposit(provider, fromDomain, toDomain[0], log, decodedLog, txReceipt, blockUnixTimestamp, resourceMap)
      decodedLogs.deposit.push(deposit)
      break
    }

    case EventType.PROPOSAL_EXECUTION: {
      const execution = parseProposalExecution(log, decodedLog, txReceipt, blockUnixTimestamp)
      decodedLogs.proposalExecution.push(execution)
      break
    }

    case EventType.FAILED_HANDLER_EXECUTION: {
      const errorData = parseFailedHandlerExecution(log, decodedLog, blockUnixTimestamp)
      decodedLogs.errors.push(errorData)
      break
    }
  }
}

export async function parseDeposit(
  provider: Provider,
  fromDomain: Domain,
  toDomain: Domain,
  log: Log,
  decodedLog: LogDescription,
  txReceipt: TransactionReceipt,
  blockUnixTimestamp: number,
  resourceMap: Map<string, EvmResource>,
): Promise<DecodedDepositLog> {
  const resourceType = resourceMap.get(decodedLog.args.resourceID as string)?.type || ""
  const resourceDecimals = resourceMap.get(decodedLog.args.resourceID as string)?.decimals || 18

  return {
    blockNumber: log.blockNumber,
    depositNonce: Number(decodedLog.args.depositNonce),
    toDomainId: decodedLog.args.destinationDomainID as string,
    sender: txReceipt.from,
    destination: await parseDestination(decodedLog.args.data as BytesLike, toDomain, resourceType),
    fromDomainId: fromDomain.id.toString(),
    resourceID: decodedLog.args.resourceID as string,
    txHash: log.transactionHash,
    timestamp: blockUnixTimestamp,
    depositData: decodedLog.args.data as string,
    handlerResponse: decodedLog.args.handlerResponse as string,
    transferType: resourceType,
    amount: decodeAmountsOrTokenId(decodedLog.args.data as string, resourceDecimals, resourceType) as string,
    fee: await getFee(provider, fromDomain.feeRouter, toDomain, fromDomain, decodedLog),
  }
}

export async function parseDestination(hexData: BytesLike, domain: Domain, resourceType: string): Promise<string> {
  const arrayifyData = getBytes(hexData)
  let recipient = ""
  switch (resourceType) {
    case ResourceTypes.FUNGIBLE:
    case ResourceTypes.NON_FUNGIBLE: {
      const recipientlen = Number("0x" + Buffer.from(arrayifyData.slice(32, 64)).toString("hex"))
      recipient = "0x" + Buffer.from(arrayifyData.slice(64, 64 + recipientlen)).toString("hex")
      break
    }
    case ResourceTypes.PERMISSIONLESS_GENERIC:
      {
        // 32 + 2 + 1 + 1 + 20 + 20
        const lenExecuteFuncSignature = Number("0x" + Buffer.from(arrayifyData.slice(32, 34)).toString("hex"))
        const lenExecuteContractAddress = Number(
          "0x" + Buffer.from(arrayifyData.slice(34 + lenExecuteFuncSignature, 35 + lenExecuteFuncSignature)).toString("hex"),
        )
        recipient =
          "0x" +
          Buffer.from(arrayifyData.slice(35 + lenExecuteFuncSignature, 35 + lenExecuteFuncSignature + lenExecuteContractAddress)).toString("hex")
      }
      break
    default:
      logger.error(`Unsupported resource type: ${resourceType}`)
  }

  let destination = ""
  if (domain.type == DomainTypes.EVM) {
    destination = recipient
  } else if (domain.type == DomainTypes.SUBSTRATE) {
    destination = await parseSubstrateDestination(recipient, domain)
  }
  return destination
}

async function parseSubstrateDestination(recipient: string, domain: Domain): Promise<string> {
  const rpcUrlConfig = getSsmDomainConfig()
  const wsProvider = new WsProvider(rpcUrlConfig.get(domain.id))
  const api = await ApiPromise.create({
    provider: wsProvider,
  })

  const decodedData = api.createType("MultiLocation", recipient)
  const multiAddress = decodedData.toJSON() as unknown as MultiLocation
  for (const [, junctions] of Object.entries(multiAddress.interior)) {
    const junston = junctions as Junction
    if (junston.accountId32?.id) {
      return junston.accountId32.id
    }
  }
  return ""
}

export function parseProposalExecution(
  log: Log,
  decodedLog: LogDescription,
  txReceipt: TransactionReceipt,
  blockUnixTimestamp: number,
): DecodedProposalExecutionLog {
  const originDomainID = decodedLog.args.originDomainID as number
  return {
    blockNumber: log.blockNumber,
    from: txReceipt.from,
    depositNonce: Number(decodedLog.args.depositNonce as string),
    txHash: log.transactionHash,
    timestamp: blockUnixTimestamp,
    fromDomainId: originDomainID.toString(),
  }
}

export async function getFee(
  provider: Provider,
  feeHandlerRouterAddress: string,
  toDomain: Domain,
  fromDomain: Domain,
  decodedLog: LogDescription,
): Promise<FeeData> {
  const feeRouter = gerFeeRouterContract(provider, feeHandlerRouterAddress)
  const fee = (await feeRouter.calculateFee(
    decodedLog.args.user as string,
    fromDomain.id,
    toDomain.id,
    decodedLog.args.resourceID as string,
    decodedLog.args.data as string,
    "0x00",
  )) as FeeDataResponse

  return {
    tokenAddress: fee.tokenAddress,
    tokenSymbol:
      fee.tokenAddress == nativeTokenAddress
        ? fromDomain.nativeTokenSymbol
        : ((await getERC20Contract(provider, fee.tokenAddress).symbol()) as string),
    amount: fee.fee.toString(),
  }
}

export function parseFailedHandlerExecution(log: Log, decodedLog: LogDescription, blockUnixTimestamp: number): DecodedFailedHandlerExecution {
  const originDomainID = decodedLog.args.originDomainID as number
  const errorData = decodedLog.args.lowLevelData as ArrayBuffer
  return {
    domainId: originDomainID.toString(),
    depositNonce: Number(decodedLog.args.depositNonce as string),
    txHash: log.transactionHash,
    message: ethers.decodeBytes32String("0x" + Buffer.from(errorData.slice(-64)).toString()),
    blockNumber: log.blockNumber,
    timestamp: blockUnixTimestamp,
  }
}

function decodeAmountsOrTokenId(data: string, decimals: number, resourceType: string): string | Error {
  switch (resourceType) {
    case DepositType.FUNGIBLE: {
      const amount = AbiCoder.defaultAbiCoder().decode(["uint256"], data)[0] as BigNumberish
      return formatUnits(amount, decimals)
    }
    case DepositType.NONFUNGIBLE: {
      const tokenId = AbiCoder.defaultAbiCoder().decode(["uint256"], data)[0] as number
      return tokenId.toString()
    }
    case DepositType.PERMISSIONLESS_GENERIC: {
      return ""
    }
    case DepositType.PERMISSIONED_GENERIC: {
      return ""
    }
    default:
      throw new Error(`Unknown resource type ${resourceType}`)
  }
}

export async function saveDepositLogs(
  decodedLog: DecodedDepositLog,
  transferRepository: TransferRepository,
  depositRepository: DepositRepository,
  feeRepository: FeeRepository,
  ofacComplianceService: OfacComplianceService,
  accountRepository: AccountRepository,
  coinMarketCapService: CoinMarketCapService,
  sharedConfig: SharedConfig,
): Promise<void> {
  let transfer = await transferRepository.findTransfer(decodedLog.depositNonce, Number(decodedLog.fromDomainId), Number(decodedLog.toDomainId))

  const { sender, amount, fromDomainId } = decodedLog

  const currentDomain = sharedConfig.domains.find(domain => domain.id == parseInt(fromDomainId))

  const currentResource = currentDomain!.resources.find(resource => resource.resourceId == decodedLog.resourceID)

  const tokenSymbol = currentResource?.symbol
  const resourceType = currentResource?.type

  let amountInUSD: number | null

  if (resourceType !== "fungible") {
    amountInUSD = null
  } else {
    try {
      amountInUSD = await coinMarketCapService.getValueInUSD(amount, tokenSymbol!)
    } catch (error) {
      logger.error((error as Error).message)
      amountInUSD = 0
    }
  }

  let senderStatus: string

  try {
    senderStatus = (await ofacComplianceService.checkSanctionedAddress(sender)) as string
  } catch (e) {
    logger.error(`Checking address failed: ${(e as Error).message}`)
    senderStatus = ""
  }

  await accountRepository.insertAccount({
    id: decodedLog.sender,
    addressStatus: senderStatus,
  })

  if (!transfer) {
    transfer = await transferRepository.insertDepositTransfer({ ...decodedLog, usdValue: amountInUSD })
  } else {
    const dataToSave = {
      ...decodedLog,
      usdValue: amountInUSD,
    }
    await transferRepository.updateTransfer(dataToSave, transfer.id)
  }

  const deposit = {
    id: new ObjectId().toString(),
    type: decodedLog.transferType,
    txHash: decodedLog.txHash,
    blockNumber: decodedLog.blockNumber.toString(),
    depositData: decodedLog.depositData,
    timestamp: new Date(decodedLog.timestamp * 1000),
    handlerResponse: decodedLog.handlerResponse,
    transferId: transfer.id,
  }
  await depositRepository.insertDeposit(deposit)
  await saveFee(decodedLog.fee, transfer.id, feeRepository)
}

export async function saveFee(fee: FeeData, transferID: string, feeRepository: FeeRepository): Promise<void> {
  const feeData = {
    id: new ObjectId().toString(),
    transferId: transferID,
    ...fee,
  }
  await feeRepository.insertFee(feeData)
}

export async function saveProposalExecutionLogs(
  decodedLog: DecodedProposalExecutionLog,
  toDomainId: number,
  transferRepository: TransferRepository,
  executionRepository: ExecutionRepository,
): Promise<void> {
  let transfer = await transferRepository.findTransfer(decodedLog.depositNonce, Number(decodedLog.fromDomainId), toDomainId)
  if (!transfer) {
    const dataToInsert = {
      ...decodedLog,
    }
    transfer = await transferRepository.insertExecutionTransfer(dataToInsert, toDomainId)
  } else {
    await transferRepository.updateStatus(TransferStatus.executed, transfer.id, "")
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    txHash: decodedLog.txHash,
    timestamp: new Date(decodedLog.timestamp * 1000),
    blockNumber: decodedLog.blockNumber.toString(),
  }
  await executionRepository.insertExecution(execution)
}

export async function saveFailedHandlerExecutionLogs(
  error: DecodedFailedHandlerExecution,
  toDomainId: number,
  transferRepository: TransferRepository,
  executionRepository: ExecutionRepository,
): Promise<void> {
  let transfer = await transferRepository.findTransfer(error.depositNonce, Number(error.domainId), toDomainId)
  if (!transfer) {
    transfer = await transferRepository.insertFailedTransfer(error, toDomainId)
  } else {
    await transferRepository.updateStatus(TransferStatus.failed, transfer.id, error.message)
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    txHash: error.txHash,
    timestamp: new Date(error.timestamp * 1000),
    blockNumber: error.blockNumber.toString(),
  }
  await executionRepository.insertExecution(execution)
}
