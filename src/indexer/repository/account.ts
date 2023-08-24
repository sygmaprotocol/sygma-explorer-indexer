import { Account, PrismaClient } from "@prisma/client"

class AccountRepository {
  public prismaClient = new PrismaClient()
  public account = this.prismaClient.account

  public async insertAccount(account: Account): Promise<void> {
    await this.account.upsert({
      where: {
        id: account.id,
      },
      update: {
        addressStatus: account.addressStatus,
      },
      create: {
        id: account.id,
        addressStatus: account.addressStatus,
      },
    })
  }
}

export default AccountRepository
