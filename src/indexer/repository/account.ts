/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
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
        address: account.address,
        addressStatus: account.addressStatus,
      },
    })
  }
}

export default AccountRepository
