/* eslint-disable @typescript-eslint/no-misused-promises */
import { ObjectId } from "mongodb"
import { AbiCoder, formatEther } from "ethers"
import { BlockHash } from "@polkadot/types/interfaces"
import { ApiPromise } from "@polkadot/api"
import { TransferStatus } from "@prisma/client"
import { BigNumber } from "@ethersproject/bignumber"
import FeeRepository from "indexer/repository/fee"
import ExecutionRepository from "../../repository/execution"
import TransferRepository from "../../repository/transfer"
import { logger } from "../../../utils/logger"
import DepositRepository from "../../repository/deposit"
import {
  DepositDataToSave,
  DepositEvent,
  FailedHandlerExecutionEvent,
  FailedHandlerExecutionToSave,
  FeeCollectedDataToSave,
  FeeCollectedEvent,
  ProposalExecutionDataToSave,
  ProposalExecutionEvent,
  SubstrateEvent,
  SubstrateTypeTransfer,
  SygmaPalleteEvents,
} from "../../services/substrateIndexer/substrateTypes"
import { DecodedDepositLog } from "../../../indexer/services/evmIndexer/evmTypes"
import { Domain, SharedConfig, SubstrateResource } from "../../../indexer/config"
import { getSubstrateEvents } from "../../../indexer/services/substrateIndexer/substrateEventParser"
import CoinMarketCapService from "../../../indexer/services/coinmarketcap/coinmarketcap.service"

export async function saveProposalExecution(
  proposalExecutionData: ProposalExecutionDataToSave,
  toDomainId: number,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  const { originDomainId, depositNonce, txIdentifier, blockNumber, timestamp } = proposalExecutionData

  let transfer = await transferRepository.findTransfer(Number(depositNonce), Number(originDomainId), toDomainId)
  if (!transfer) {
    transfer = await transferRepository.insertExecutionTransfer(
      {
        depositNonce: Number(depositNonce),
        fromDomainId: originDomainId,
        timestamp,
      },
      toDomainId,
    )
  } else {
    await transferRepository.updateStatus(TransferStatus.executed, transfer.id)
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    txHash: txIdentifier,
    blockNumber: blockNumber,
  }
  await executionRepository.insertExecution(execution)
}

export async function saveFailedHandlerExecution(
  failedHandlerExecutionData: FailedHandlerExecutionToSave,
  toDomainId: number,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  const { originDomainId, depositNonce, txIdentifier, blockNumber } = failedHandlerExecutionData

  let transfer = await transferRepository.findTransfer(Number(depositNonce), Number(originDomainId), toDomainId)
  // there is no transfer yet, but a proposal execution exists
  if (!transfer) {
    transfer = await transferRepository.insertFailedTransfer(
      {
        depositNonce: Number(depositNonce),
        domainId: originDomainId,
      },
      toDomainId,
    )
  } else {
    await transferRepository.updateStatus(TransferStatus.failed, transfer.id)
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    txHash: txIdentifier,
    blockNumber: blockNumber,
  }
  await executionRepository.insertExecution(execution)
}

export async function saveDeposit(
  originDomainId: number,
  substrateDepositData: DepositDataToSave,
  transferRepository: TransferRepository,
  depositRepository: DepositRepository,
  transferMap: Map<string, string>,
  coinMakerCapService: CoinMarketCapService,
  sharedConfig: SharedConfig,
): Promise<void> {
  const {
    destDomainId: destinationDomainId,
    depositNonce,
    txIdentifier,
    blockNumber,
    depositData,
    handlerResponse,
    sender,
    resourceId,
    timestamp,
  } = substrateDepositData

  const currentDomain = sharedConfig.domains.find(domain => domain.id === originDomainId)

  const tokenSymbol = currentDomain?.resources.find(resource => resource.resourceId === resourceId)?.symbol

  const decodedAmount = getDecodedAmount(depositData)

  let transfer = await transferRepository.findTransfer(Number(depositNonce), originDomainId, Number(destinationDomainId))

  const amountInUSD = await coinMakerCapService.getValueInUSD(decodedAmount, tokenSymbol!)

  if (transfer) {
    const dataTransferToUpdate = {
      depositNonce: Number(depositNonce),
      sender,
      amount: decodedAmount,
      resourceID: resourceId,
      fromDomainId: originDomainId.toString(),
      toDomainId: destinationDomainId,
      timestamp: timestamp,
      destination: `0x${depositData.substring(2).slice(128, depositData.length - 1)}`,
      usdValue: amountInUSD,
    }
    await transferRepository.updateTransfer(dataTransferToUpdate, transfer.id)
  } else {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: Number(depositNonce),
      sender,
      amount: decodedAmount,
      resourceID: resourceId,
      fromDomainId: `${originDomainId}`,
      toDomainId: `${destinationDomainId}`,
      timestamp: timestamp,
      destination: `0x${depositData.substring(2).slice(128, depositData.length - 1)}`,
      usdValue: amountInUSD,
    } as Pick<
      DecodedDepositLog,
      "depositNonce" | "sender" | "amount" | "destination" | "resourceID" | "toDomainId" | "fromDomainId" | "timestamp"
    > & { usdValue: number }
    transfer = await transferRepository.insertSubstrateDepositTransfer(transferData)
  }

  const deposit = {
    id: new ObjectId().toString(),
    type: SubstrateTypeTransfer.Fungible,
    txHash: txIdentifier,
    blockNumber: blockNumber,
    depositData: depositData,
    handlerResponse: handlerResponse,
    transferId: transfer.id,
  }
  await depositRepository.insertDeposit(deposit)
  transferMap.set(txIdentifier, transfer.id)
}

export async function saveFee(
  fee: FeeCollectedDataToSave,
  feeRepository: FeeRepository,
  transferMap: Map<string, string>,
  resourceMap: Map<string, SubstrateResource>,
): Promise<void> {
  const feeData = {
    id: new ObjectId().toString(),
    transferId: transferMap.get(fee.txIdentifier) || "",
    tokenSymbol: resourceMap.get(fee.resourceId)?.symbol || "",
    tokenAddress: JSON.stringify(fee.feeAssetId),
    amount: fee.feeAmount,
  }
  await feeRepository.insertFee(feeData)
}

function getDecodedAmount(depositData: string): string {
  const abiCoder = AbiCoder.defaultAbiCoder()
  const parsedAmount = `0x${depositData.substring(2).slice(0, 64)}`
  const decodedDepositData = abiCoder.decode(["uint256"], parsedAmount)
  return formatEther((decodedDepositData[0] as BigNumber).toString())
}

export async function saveEvents(
  blockHash: BlockHash,
  provider: ApiPromise,
  block: number,
  domain: Domain,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
  depositRepository: DepositRepository,
  feeRepository: FeeRepository,
  resourceMap: Map<string, SubstrateResource>,
  coinMakerCapService: CoinMarketCapService,
  sharedConfig: SharedConfig,
): Promise<void> {
  const at = await provider.at(blockHash)
  const timestamp = Number((await at.query.timestamp.now()).toString())
  const allRecords = (await at.query.system.events()) as unknown as Array<SubstrateEvent>

  // we get the proposal execution events
  const proposalExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.ProposalExecution, allRecords) as Array<ProposalExecutionEvent>
  // we get the deposit events - ts-ignore because of allRecords
  const depositEvents = getSubstrateEvents(SygmaPalleteEvents.Deposit, allRecords) as Array<DepositEvent>
  const failedHandlerExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.FailedHandlerExecution, allRecords) as Array<FailedHandlerExecutionEvent>
  const feeCollectedEvents = getSubstrateEvents(SygmaPalleteEvents.FeeCollected, allRecords) as Array<FeeCollectedEvent>

  proposalExecutionEvents.forEach(async (proposalExecutionEvent: ProposalExecutionEvent) => {
    const { data } = proposalExecutionEvent.event.toHuman()
    const { originDomainId, depositNonce } = data
    const txIdentifier = `${block}-${proposalExecutionEvent.phase.asApplyExtrinsic}` //this is like the txHash but for the substrate
    await saveProposalExecutionToDb(
      domain,
      block.toString(),
      {
        originDomainId,
        depositNonce: depositNonce,
        txIdentifier,
        blockNumber: `${block}`,
        timestamp,
      },
      executionRepository,
      transferRepository,
    )
  })
  const transferMap = new Map<string, string>()

  for (const depositEvent of depositEvents) {
    const txIdentifier = `${block}-${depositEvent.phase.asApplyExtrinsic}` //this is like the txHash but for the substrate
    const { data } = depositEvent.event.toHuman()
    const { destDomainId, resourceId, depositNonce, sender, transferType, depositData, handlerResponse } = data
    await saveDepositToDb(
      domain,
      block.toString(),
      {
        destDomainId,
        resourceId,
        depositNonce: depositNonce,
        sender,
        transferType,
        depositData,
        handlerResponse,
        txIdentifier,
        blockNumber: `${block}`,
        timestamp,
      },
      transferRepository,
      depositRepository,
      transferMap,
      coinMakerCapService,
      sharedConfig,
    )
  }

  for (const feeCollectedEvent of feeCollectedEvents) {
    const txIdentifier = `${block}-${feeCollectedEvent.phase.asApplyExtrinsic}` //this is like the txHash but for the substrate
    const { data } = feeCollectedEvent.event.toHuman()

    const { destDomainId, resourceId, feeAmount, feePayer, feeAssetId } = data
    await saveFeeToDb(
      {
        destDomainId,
        resourceId,
        feeAmount,
        feePayer,
        txIdentifier,
        feeAssetId,
      },
      feeRepository,
      transferMap,
      resourceMap,
    )
  }

  failedHandlerExecutionEvents.forEach(async (failedHandlerExecutionEvent: FailedHandlerExecutionEvent) => {
    const txIdentifier = `${block}-${failedHandlerExecutionEvent.phase.asApplyExtrinsic}` //this is like the txHash but for the substrate
    const { data } = failedHandlerExecutionEvent.event.toHuman()
    const { originDomainId, depositNonce, error } = data
    await saveFailedHandlerExecutionToDb(
      domain,
      block.toString(),
      {
        originDomainId,
        depositNonce: depositNonce,
        error,
        txIdentifier,
        blockNumber: `${block}`,
        timestamp,
      },
      executionRepository,
      transferRepository,
    )
  })
}

export async function saveProposalExecutionToDb(
  domain: Domain,
  latestBlock: string,
  proposalExecutionData: ProposalExecutionDataToSave,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  logger.info(`Saving proposal execution. Save block on substrate ${domain.name}: ${latestBlock}, domain Id: ${domain.id}`)

  try {
    await saveProposalExecution(proposalExecutionData, domain.id, executionRepository, transferRepository)
  } catch (error) {
    logger.error("Error saving proposal execution:", error)
  }
}

export async function saveDepositToDb(
  domain: Domain,
  latestBlock: string,
  depositData: DepositDataToSave,
  transferRepository: TransferRepository,
  depositRepository: DepositRepository,
  transferMap: Map<string, string>,
  coinmarketcapService: CoinMarketCapService,
  sharedConfig: SharedConfig,
): Promise<void> {
  logger.info(`Saving deposit. Save block on substrate ${domain.name}: ${latestBlock}, domain Id: ${domain.id}`)

  try {
    await saveDeposit(domain.id, depositData, transferRepository, depositRepository, transferMap, coinmarketcapService, sharedConfig)
  } catch (error) {
    logger.error("Error saving substrate deposit:", error)
  }
}

export async function saveFeeToDb(
  fee: FeeCollectedDataToSave,
  feeRepository: FeeRepository,
  transferMap: Map<string, string>,
  resourceMap: Map<string, SubstrateResource>,
): Promise<void> {
  try {
    await saveFee(fee, feeRepository, transferMap, resourceMap)
  } catch (error) {
    logger.error("Error saving substrate fee:", error)
  }
}

export async function saveFailedHandlerExecutionToDb(
  domain: Domain,
  latestBlock: string,
  failedHandlerExecutionData: FailedHandlerExecutionToSave,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  logger.info(`Saving failed proposal execution. Save block on substrate ${domain.name}: ${latestBlock}, domain Id: ${domain.id}`)

  try {
    await saveFailedHandlerExecution(failedHandlerExecutionData, domain.id, executionRepository, transferRepository)
  } catch (error) {
    logger.error("Error saving failed handler execution: ", error)
  }
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
