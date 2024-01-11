/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import dotenv from "dotenv"
import TransferRepository from "../../indexer/repository/transfer"
import { logger } from "../../utils/logger"
import { IFixInterface } from "../interfaces"
import DepositRepository from "../../indexer/repository/deposit"
import ExecutionRepository from "../../indexer/repository/execution"

dotenv.config()
export class DuplicateRemover implements IFixInterface {
  private depositRepository: DepositRepository
  private executionRepository: ExecutionRepository
  private transferRepository: TransferRepository
  constructor() {
    this.depositRepository = new DepositRepository()
    this.executionRepository = new ExecutionRepository()
    this.transferRepository = new TransferRepository()
  }

  private async deleteDepositDuplicates(): Promise<void> {
    const allDeposits = await this.depositRepository.deposit.findMany()

    const seenTransferIds = new Set<string>()
    const duplicateDepositIds: string[] = []

    for (const deposit of allDeposits) {
      if (seenTransferIds.has(deposit.transferId)) {
        duplicateDepositIds.push(deposit.id)
      } else {
        seenTransferIds.add(deposit.transferId)
      }
    }

    // Remove duplicates by deleting the extra deposits
    await this.depositRepository.deposit.deleteMany({
      where: {
        id: {
          in: duplicateDepositIds,
        },
      },
    })

    logger.info("Duplicates removed successfully")
  }
  private async deleteExecutionDuplicates(): Promise<void> {
    const allExecutions = await this.executionRepository.execution.findMany()

    const seenTransferIds = new Set<string>()
    const duplicateExecutionIds: string[] = []

    for (const execution of allExecutions) {
      if (seenTransferIds.has(execution.transferId)) {
        duplicateExecutionIds.push(execution.id)
      } else {
        seenTransferIds.add(execution.transferId)
      }
    }

    // Remove duplicates by deleting the extra deposits
    await this.executionRepository.execution.deleteMany({
      where: {
        id: {
          in: duplicateExecutionIds,
        },
      },
    })

    logger.info("Duplicates removed successfully")
  }
  private async addTimestampToDepositAndExecution(): Promise<void> {
    // Fetch deposits and executions without a timestamp
    const depositsWithoutTimestamp = await this.depositRepository.deposit.findMany({
      where: {
        OR: [{ timestamp: null }, { timestamp: { isSet: false } }], // Assuming null or undefined means the field is missing
      },
    })

    const executionsWithoutTimestamp = await this.executionRepository.execution.findMany({
      where: {
        OR: [{ timestamp: null }, { timestamp: { isSet: false } }],
      },
    })

    // Update deposits with the corresponding transfer.timestamp
    for (const deposit of depositsWithoutTimestamp) {
      const transfer = (await this.transferRepository.transfer.findRaw({
        filter: { _id: { $oid: deposit.transferId } },
      })) as unknown as Array<{ timestamp: { $date: string } }>

      if (transfer) {
        await this.depositRepository.deposit.update({
          where: {
            id: deposit.id,
          },
          data: {
            timestamp: new Date(transfer[0].timestamp["$date"]),
          },
        })
      }
    }

    // Update executions with the corresponding transfer.timestamp
    for (const execution of executionsWithoutTimestamp) {
      const transfer = (await this.transferRepository.transfer.findRaw({
        filter: { _id: { $oid: execution.transferId } },
      })) as unknown as Array<{ timestamp: { $date: string } }>

      if (transfer) {
        await this.executionRepository.execution.update({
          where: {
            id: execution.id,
          },
          data: {
            timestamp: new Date(transfer[0].timestamp["$date"]),
          },
        })
      }
    }

    logger.info("Timestamps updated completed successfully")
  }
  public async executeAction(): Promise<void> {
    await this.deleteDepositDuplicates()
    await this.deleteExecutionDuplicates()
    await this.addTimestampToDepositAndExecution()
  }
}
