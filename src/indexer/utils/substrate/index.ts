/* eslint-disable @typescript-eslint/no-misused-promises */
import { ObjectId } from "mongodb"
import { AbiCoder, formatEther } from "ethers"
import { BlockHash } from "@polkadot/types/interfaces"
import { ApiPromise } from "@polkadot/api"
import { TransferStatus } from "@prisma/client"
import { BigNumber } from "@ethersproject/bignumber"
import ExecutionRepository from "../../repository/execution"
import TransferRepository from "../../repository/transfer"
import { logger } from "../../../utils/logger"
import DepositRepository from "../../repository/deposit"
import {
  DepositDataToSave,
  DepositEvent,
  FailedHandlerExecutionEvent,
  FailedHandlerExecutionToSave,
  ProposalExecutionDataToSave,
  ProposalExecutionEvent,
  SubstrateEvent,
  SubstrateTypeTransfer,
  SygmaPalleteEvents,
} from "../../services/substrateIndexer/substrateTypes"
import { DecodedDepositLog } from "../../../indexer/services/evmIndexer/evmTypes"
import { Domain } from "../../../indexer/config"
import { getSubstrateEvents } from "../../../indexer/services/substrateIndexer/substrateEventParser"

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
        resourceID: null,
      },
      toDomainId,
    )
  } else {
    await transferRepository.updateStatus(TransferStatus.executed, transfer.id)
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer.id,
    type: SubstrateTypeTransfer.Fungible,
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
    type: SubstrateTypeTransfer.Fungible,
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

  const decodedAmount = getDecodedAmount(depositData)
  let transfer = await transferRepository.findTransfer(Number(depositNonce), originDomainId, Number(destinationDomainId))
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
    } as Pick<DecodedDepositLog, "depositNonce" | "sender" | "amount" | "destination" | "resourceID" | "toDomainId" | "fromDomainId" | "timestamp">
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
): Promise<void> {
  const at = await provider.at(blockHash)
  const timestamp = Number((await at.query.timestamp.now()).toString())
  const allRecords = (await at.query.system.events()) as unknown as Array<SubstrateEvent>

  // we get the proposal execution events
  const proposalExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.ProposalExecution, allRecords) as Array<ProposalExecutionEvent>
  // we get the deposit events - ts-ignore because of allRecords
  const depositEvents = getSubstrateEvents(SygmaPalleteEvents.Deposit, allRecords) as Array<DepositEvent>
  const failedHandlerExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.FailedHandlerExecution, allRecords) as Array<FailedHandlerExecutionEvent>

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

  depositEvents.forEach(async (depositEvent: DepositEvent) => {
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
    )
  })

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
): Promise<void> {
  logger.info(`Saving deposit. Save block on substrate ${domain.name}: ${latestBlock}, domain Id: ${domain.id}`)

  try {
    await saveDeposit(domain.id, depositData, transferRepository, depositRepository)
  } catch (error) {
    logger.error("Error saving substrate deposit:", error)
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
