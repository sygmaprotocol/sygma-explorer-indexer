/* eslint-disable @typescript-eslint/no-misused-promises */
import { ObjectId } from "mongodb"
import { AbiCoder, formatEther } from "ethers"
import { BlockHash } from "@polkadot/types/interfaces"
import { ApiPromise } from "@polkadot/api"
import { Transfer, TransferStatus } from "@prisma/client"
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
import DomainRepository from "../../../indexer/repository/domain"

export async function saveProposalExecution(
  proposalExecutionData: ProposalExecutionDataToSave,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  const { originDomainId, depositNonce, txIdentifier, blockNumber, timestamp } = proposalExecutionData

  let transfer = await transferRepository.findByNonceFromDomainId(Number(depositNonce), originDomainId)
  // there is no transfer yet, but a proposal execution exists
  if (!transfer) {
    try {
      transfer = await transferRepository.insertExecutionTransfer({
        depositNonce: Number(depositNonce),
        fromDomainId: originDomainId,
        timestamp,
        resourceID: null,
      })
    } catch (e) {
      logger.error("Error inserting substrate proposal execution transfer:", e)
    }
  } else {
    try {
      await transferRepository.updateStatus(TransferStatus.executed, transfer.id)
    } catch (e) {
      logger.error(`Error updating substrate proposal execution transfer: ${e}`)
    }
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer!.id,
    type: SubstrateTypeTransfer.Fungible,
    txHash: txIdentifier,
    blockNumber: blockNumber,
  }
  try {
    await executionRepository.insertExecution(execution)
  } catch (e) {
    logger.error("Error inserting substrate proposal execution:", e)
  }
}

export async function saveFailedHandlerExecution(
  failedHandlerExecutionData: FailedHandlerExecutionToSave,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  const { originDomainId, depositNonce, txIdentifier, blockNumber } = failedHandlerExecutionData

  const transfer = await transferRepository.findByNonceFromDomainId(Number(depositNonce), originDomainId)
  // there is no transfer yet, but a proposal execution exists
  if (!transfer) {
    await transferRepository.insertFailedTransfer({
      depositNonce: Number(depositNonce),
      domainId: originDomainId,
    })
  } else {
    await transferRepository.updateStatus(TransferStatus.failed, transfer.id)
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer!.id,
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
  let transfer: Transfer | null
  transfer = await transferRepository.findByNonceFromDomainId(Number(depositNonce), `${originDomainId}`)
  if (transfer) {
    const dataTransferToUpdate = {
      depositNonce: Number(depositNonce),
      sender,
      amount: decodedAmount,
      resourceID: resourceId,
      fromDomainId: `${originDomainId}`,
      toDomainId: `${destinationDomainId}`,
      timestamp: timestamp,
      destination: "", // FIX
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
    } as Pick<DecodedDepositLog, "depositNonce" | "sender" | "amount" | "resourceID" | "toDomainId" | "fromDomainId" | "timestamp">
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
  domainRepository: DomainRepository,
): Promise<void> {
  const signedBlock = await provider.rpc.chain.getBlock(blockHash)
  const at = await provider.at(blockHash)
  const timestamp = Number((await at.query.timestamp.now()).toString())
  const allRecords = (await at.query.system.events()) as unknown as Array<SubstrateEvent>

  // we get the proposal execution events
  const proposalExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.ProposalExecution, allRecords) as Array<ProposalExecutionEvent>
  // we get the deposit events - ts-ignore because of allRecords
  const depositEvents = getSubstrateEvents(SygmaPalleteEvents.Deposit, allRecords) as Array<DepositEvent>
  const failedHandlerExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.FailedHandlerExecution, allRecords) as Array<FailedHandlerExecutionEvent>
  // we get the index of the section in the extrinsic
  const sectionIndex = signedBlock.block.extrinsics.findIndex(ex => ex.method.section === "sygmaBridge")
  // this is our identifier for the tx
  const txIdentifier = `${block}-${sectionIndex}` //this is like the txHash but for the substrate

  proposalExecutionEvents.forEach(async (proposalExecutionEvent: ProposalExecutionEvent) => {
    const { data } = proposalExecutionEvent.event.toHuman()
    const { originDomainId, depositNonce } = data
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
  await domainRepository.updateBlock(block.toString(), domain.id)
  logger.info(`save block on ${domain.name}: ${block.toString()}, domainID: ${domain.id}`)
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
    await saveProposalExecution(proposalExecutionData, executionRepository, transferRepository)
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
    await saveFailedHandlerExecution(failedHandlerExecutionData, executionRepository, transferRepository)
  } catch (error) {
    logger.error("Error saving failed handler execution: ", error)
  }
}
