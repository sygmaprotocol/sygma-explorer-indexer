import { ObjectId } from "mongodb";
import { AbiCoder, formatEther } from 'ethers'
import ExecutionRepository from "../../../indexer/repository/execution";
import TransferRepository from "../../../indexer/repository/transfer";
import { Transfer, TransferStatus } from "@prisma/client";
import { logger } from "../../../utils/logger";
import DepositRepository from "../../../indexer/repository/deposit";
import { DepositDataToSave, FailedHandlerExecutionToSave, ProposalExecutionDataToSave, SubstrateTypeTransfer } from "../../../indexer/services/substrateIndexer/substrateTypes";

export async function saveProposalExecution(
  proposalExecutionData: ProposalExecutionDataToSave,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  const { originDomainId, depositNonce, txIdentifier, blockNumber, timestamp
  } = proposalExecutionData

  let transfer = await transferRepository.findByNonceFromDomainId(
    Number(depositNonce),
    originDomainId
  )

  // there is no transfer but still we have proposal execution
  if (!transfer) {
    try {
      await transferRepository.insertExecutionTransfer({
        depositNonce: Number(depositNonce),
        fromDomainId: originDomainId,
        timestamp,
        resourceID: null
      })
    } catch (e) {
      logger.error(`Error inserting substrate proposal execution transfer: ${e}`)
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
    type: "fungible", // TODO: remove this hardcoded string
    txHash: txIdentifier,
    blockNumber: blockNumber
  }

  await executionRepository.insertExecution(execution)
}

export async function saveFailedHandlerExecution(
  failedHandlerExecutionData: FailedHandlerExecutionToSave,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
){
  const { originDomainId, depositNonce, error, txIdentifier, blockNumber, timestamp } = failedHandlerExecutionData

  let transfer = await transferRepository.findByNonceFromDomainId(
    Number(depositNonce),
    originDomainId
  )

   // there is no transfer but still we have proposal execution
   if (!transfer) {
    try {
      await transferRepository.insertFailedTransfer({
        depositNonce: Number(depositNonce),
        domainId: originDomainId,
      })
    } catch (e) {
      logger.error(`Error inserting failed substrate proposal execution transfer: ${e}`)
    }
  } else {
    try {
      await transferRepository.updateStatus(TransferStatus.failed, transfer.id)
    } catch (e) {
      logger.error(`Error updating substrate failed proposal execution transfer: ${e}`)
    }
  }

  const execution = {
    id: new ObjectId().toString(),
    transferId: transfer!.id,
    type: SubstrateTypeTransfer.Fungible,
    txHash: txIdentifier,
    blockNumber: blockNumber
  }

  await executionRepository.insertExecution(execution)
  
}

export async function saveDeposit(
  substrateDepositData: DepositDataToSave,
  transferRepository: TransferRepository,
  depositRepository: DepositRepository
): Promise<void> {
  const { destDomainId: destinationDomainId, depositNonce, txIdentifier, blockNumber, depositData, handlerResponse, sender, resourceId, timestamp
  } = substrateDepositData

  const decodedAmount = getDecodedAmount(depositData)
  
  const transferData = {
    id: new ObjectId().toString(),
    depositNonce: Number(depositNonce),
    sender: sender,
    amount: decodedAmount,
    status: TransferStatus.pending,
    resource: {
      connect: {
        id: resourceId
      }
    },
    fromDomain: {
      connect: {
        id: '3'
      },
    },
    toDomain: {
      connect: {
        id: destinationDomainId
      }
    },
    timestamp: timestamp,
  }

  let insertedTransfer: Transfer | undefined
  try {
    insertedTransfer = await transferRepository.insertSubstrateDepositTransfer(transferData)
  } catch (e) {
    logger.error(`Error inserting substrate deposit: ${e}`)
  }

  if (insertedTransfer !== undefined) {
    const deposit = {
      id: new ObjectId().toString(),
      type: "fungible", // TODO: remove this hardcoded string
      txHash: txIdentifier,
      blockNumber: blockNumber,
      depositData: depositData,
      handlerResponse: handlerResponse,
      transferId: insertedTransfer!.id,
    }

    try {
      await depositRepository.insertDeposit(deposit)
    } catch (e) {
      logger.error(`Error inserting substrate deposit: ${e}`)
    }

  }

}

function getDecodedAmount(depositData: string): string {
  const abiCoder = AbiCoder.defaultAbiCoder()
  const parsedAmount = `0x${depositData.substring(2).slice(0, 64)}`
  const decodedDepositData = abiCoder.decode(["uint256"], parsedAmount)
  return formatEther(decodedDepositData[0].toString())
}