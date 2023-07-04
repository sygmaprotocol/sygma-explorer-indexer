import { Execution, PrismaClient } from "@prisma/client"

class ExecutionRepository {
  public prismaClient = new PrismaClient()
  public execution = this.prismaClient.execution

  public async insertExecution(execution: Execution): Promise<void> {
    await this.execution.create({ data: execution })
  }
}
export default ExecutionRepository
