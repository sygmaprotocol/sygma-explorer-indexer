import { ObjectId } from "mongodb";
import ExecutionRepository from "../../../indexer/repository/execution";
import TransferRepository from "../../../indexer/repository/transfer";
import { Transfer, TransferStatus } from "@prisma/client";
import { logger } from "../../../utils/logger";
import DepositRepository from "../../../indexer/repository/deposit";

export async function saveProposalExecution(
  proposalExecutionData: any,
  executionRepository: ExecutionRepository,
  transferRepository: TransferRepository,
): Promise<void> {
  const { originDomainId, depositNonce, txIdentifier, blockNumber
  } = proposalExecutionData

  let transfer = await transferRepository.findByNonceFromDomainId(
    depositNonce,
    originDomainId
  )

  // there is no transfer but still we have proposal execution
  if (!transfer) {
    try {
      await transferRepository.insertExecutionSubstrateTransfer(
        originDomainId,
        depositNonce,
      )
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

export async function saveDeposit(
  substrateDepositData: any,
  transferRepository: TransferRepository,
  depositRepository: DepositRepository
): Promise<void> {
  const { destinationDomainId, depositNonce, txIdentifier, blockNumber, depositData, handlerResponse, sender, resourceId
  } = substrateDepositData
  const transferData = {
    id: new ObjectId().toString(),
    depositNonce: depositNonce,
    sender: sender,
    amount: null, // TODO: decode this from deposit data
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
    timestamp: null, // TODO: check dot api to get timestamp
  }

  let insertedTransfer: Transfer | undefined
  try {
    insertedTransfer = await transferRepository.insertSubstrateDepositTransfer(transferData)
  } catch (e){
    logger.error(`Error inserting substrate deposit: ${e}`)
  }

  if(insertedTransfer !== undefined) {
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