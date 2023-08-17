import { Account, PrismaClient } from "@prisma/client"

class AccountRepository {
  public prismaClient = new PrismaClient()
  public account = this.prismaClient.account

  public async insertAccount(account: Account): Promise<void> {
    await this.account.create({ data: account })
  }
}

export default AccountRepository
