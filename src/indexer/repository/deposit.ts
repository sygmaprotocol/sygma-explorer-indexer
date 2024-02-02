/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Deposit, PrismaClient } from "@prisma/client"

class DepositRepository {
  public prismaClient = new PrismaClient()
  public deposit = this.prismaClient.deposit

  public async insertDeposit(deposit: Deposit): Promise<void> {
    await this.deposit.create({ data: deposit })
  }

  public async findDeposit(transferID: string): Promise<Deposit | null> {
    return await this.deposit.findFirst({
      where: {
        transferId: transferID,
      },
    })
  }
}

export default DepositRepository
