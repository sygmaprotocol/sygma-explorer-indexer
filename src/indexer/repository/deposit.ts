import { Deposit, PrismaClient } from "@prisma/client"

class DepositRepository {
  public deposit = new PrismaClient().deposit

  public async insertDeposit(deposit: Deposit): Promise<void> {
    await this.deposit.create({ data: deposit })
  }
}
export default DepositRepository
