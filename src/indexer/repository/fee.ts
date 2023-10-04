/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Fee, PrismaClient } from "@prisma/client"

class FeeRepository {
  public fee = new PrismaClient().fee

  public async insertFee(fee: Fee): Promise<Fee> {
    return await this.fee.create({ data: fee })
  }
}
export default FeeRepository
