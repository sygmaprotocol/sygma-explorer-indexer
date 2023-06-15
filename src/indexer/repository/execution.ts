import { Execution, PrismaClient } from "@prisma/client"

class ExecutionRepository {
  public execution = new PrismaClient().execution

  public async insertExecution(execution: Execution): Promise<void> {
    await this.execution.create({ data: execution })
  }
}
export default ExecutionRepository
