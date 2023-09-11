import { BytesLike, Contract, Log, LogDescription, Provider, TransactionReceipt, getBytes, AbiCoder, formatUnits, BigNumberish, ethers } from "ethers"
import BasicFeeHandlerContract from "@buildwithsygma/sygma-contracts/build/contracts/BasicFeeHandler.json"
import DynamicERC20FeeHandlerEVM from "@buildwithsygma/sygma-contracts/build/contracts/DynamicERC20FeeHandlerEVM.json"
import Bridge from "@buildwithsygma/sygma-contracts/build/contracts/Bridge.json"
import { BigNumber } from "@ethersproject/bignumber"
import { ObjectId } from "mongodb"
import { TransferStatus } from "@prisma/client"
import { MultiLocation } from "@polkadot/types/interfaces"
import { ApiPromise, WsProvider } from "@polkadot/api"
import AccountRepository from "../../repository/account"
import TransferRepository from "../../repository/transfer"
import DepositRepository from "../../repository/deposit"
import { logger } from "../../../utils/logger"
import { Domain, DomainTypes, EvmResource, SharedConfig, getSsmDomainConfig } from "../../config"
import {
  DecodedDepositLog,
  DecodedFailedHandlerExecution,
  DecodedFeeCollectedLog,
  DecodedLogs,
  DecodedProposalExecutionLog,
  DepositType,
  EventType,
  FeeHandlerType,
} from "../../services/evmIndexer/evmTypes"
import { getERC20Contract } from "../../services/contract"
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
    const contract = new Contract(contractData[0].address, BasicFeeHandlerContract.abi, provider)

    decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
  } else if (contractData[0]?.type == FeeHandlerType.DYNAMIC) {
    const contract = new Contract(contractData[0].address, DynamicERC20FeeHandlerEVM.abi, provider)

    decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
  } else if (fromDomain.bridge.toLowerCase() == log.address.toLowerCase()) {
    const contract = new Contract(fromDomain.bridge, Bridge.abi, provider)

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
      const deposit = await parseDeposit(fromDomain, toDomain[0], log, decodedLog, txReceipt, blockUnixTimestamp, resourceMap)
      decodedLogs.deposit.push(deposit)
      break
    }

    case EventType.PROPOSAL_EXECUTION: {
      const execution = parseProposalExecution(log, decodedLog, txReceipt, blockUnixTimestamp)
      decodedLogs.proposalExecution.push(execution)
      break
    }

    case EventType.FAILED_HANDLER_EXECUTION: {
      const errorData = parseFailedHandlerExecution(log, decodedLog)
      decodedLogs.errors.push(errorData)
      break
    }

    case EventType.FEE_COLLECTED: {
      const feeCollected = await parseFeeCollected(decodedLog, provider, fromDomain.nativeTokenSymbol, log)
      decodedLogs.feeCollected.push(feeCollected)
      break
    }
  }
}

export async function parseDeposit(
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
    destination: await parseDestination(decodedLog.args.data as BytesLike, toDomain),
    fromDomainId: fromDomain.id.toString(),
    resourceID: decodedLog.args.resourceID as string,
    txHash: log.transactionHash,
    timestamp: blockUnixTimestamp,
    depositData: decodedLog.args.data as string,
    handlerResponse: decodedLog.args.handlerResponse as string,
    transferType: resourceType,
    amount: decodeAmountsOrTokenId(decodedLog.args.data as string, resourceDecimals, resourceType) as string,
  }
}

export async function parseDestination(hexData: BytesLike, domain: Domain): Promise<string> {
  const arrayifyData = getBytes(hexData)
  const recipientlen = Number("0x" + Buffer.from(arrayifyData.slice(32, 64)).toString("hex"))
  const recipient = "0x" + Buffer.from(arrayifyData.slice(64, 64 + recipientlen)).toString("hex")

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

export async function parseFeeCollected(
  decodedLog: LogDescription,
  provider: Provider,
  nativeTokenSymbol: string,
  log: Log,
): Promise<DecodedFeeCollectedLog> {
  const ercToken = getERC20Contract(provider, decodedLog.args.tokenAddress as string)

  return {
    amount: BigNumber.from(decodedLog.args.fee as number).toString(),
    tokenSymbol: (decodedLog.args.tokenAddress as string) == nativeTokenAddress ? nativeTokenSymbol : (await ercToken?.symbol()) || "",
    tokenAddress: decodedLog.args.tokenAddress as string,
    txHash: log.transactionHash,
  }
}

export function parseFailedHandlerExecution(log: Log, decodedLog: LogDescription): DecodedFailedHandlerExecution {
  const originDomainID = decodedLog.args.originDomainID as number
  const errorData = decodedLog.args.lowLevelData as ArrayBuffer
  return {
    domainId: originDomainID.toString(),
    depositNonce: Number(decodedLog.args.depositNonce as string),
    txHash: log.transactionHash,
    message: ethers.decodeBytes32String("0x" + Buffer.from(errorData.slice(-64)).toString()),
    blockNumber: log.blockNumber,
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
  transferMap: Map<string, string>,
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
      timestamp: decodedLog.timestamp * 1000,
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
    handlerResponse: decodedLog.handlerResponse,
    transferId: transfer.id,
  }
  await depositRepository.insertDeposit(deposit)
  transferMap.set(decodedLog.txHash, transfer.id)
}

export async function saveFeeLogs(fee: DecodedFeeCollectedLog, transferMap: Map<string, string>, feeRepository: FeeRepository): Promise<void> {
  const feeData = {
    id: new ObjectId().toString(),
    transferId: transferMap.get(fee.txHash) || "",
    tokenSymbol: fee.tokenSymbol,
    tokenAddress: fee.tokenAddress,
    amount: fee.amount,
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
      timestamp: decodedLog.timestamp * 1000,
    }
    transfer = await transferRepository.insertExecutionTransfer(dataToInsert, toDomainId)
  } else {
    await transferRepository.updateStatus(TransferStatus.executed, transfer.id, "")
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    txHash: decodedLog.txHash,
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
    blockNumber: error.blockNumber.toString(),
  }
  await executionRepository.insertExecution(execution)
}
