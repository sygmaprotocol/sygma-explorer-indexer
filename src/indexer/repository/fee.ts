import { Fee, PrismaClient } from "@prisma/client"

class FeeRepository {
  public fee = new PrismaClient().fee

  public async insertFee(fee: Fee): Promise<Fee> {
    return await this.fee.create({ data: fee })
  }
}
export default FeeRepository
