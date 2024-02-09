/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Execution, PrismaClient } from "@prisma/client"

class ExecutionRepository {
  public prismaClient = new PrismaClient()
  public execution = this.prismaClient.execution

  public async upsertExecution(execution: Execution): Promise<void> {
    await this.execution.upsert({
      where: {
        transferId: execution.transferId,
      },
      update: {
        txHash: execution.txHash,
        blockNumber: execution.blockNumber,
        timestamp: execution.timestamp,
      },
      create: execution,
    })
  }
}
export default ExecutionRepository
