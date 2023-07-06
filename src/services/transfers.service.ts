import { PrismaClient, Transfer, TransferStatus } from "@prisma/client"
import { NotFound, getTransferQueryParams } from "../utils/helpers"

export type TransfersByCursorOptions = {
  page: string
  limit: string
  status?: TransferStatus
  [key: string]: string | undefined
}

class TransfersService {
  public transfers = new PrismaClient().transfer

  private prepareQueryParams(args: TransfersByCursorOptions): {
    skip: number
    take: number
    where: (TransferStatus & { sender: string }) | {}
  } {
    const { page, limit, ...rest } = args

    const pageSize = parseInt(limit, 10)
    const pageIndex = parseInt(page, 10)
    const skip = (pageIndex - 1) * pageSize
    const take = pageSize

    const where = rest ? { ...rest } : ({} as (TransferStatus & { sender: string }) | {})

    return {
      skip,
      take,
      where,
    }
  }

  public async findTransferById({ id }: { id: string }): Promise<Transfer> {
    const transfer = await this.transfers.findUnique({
      where: { id },
      include: {
        ...getTransferQueryParams().include,
      },
    })
    if (!transfer) throw new NotFound("Transfer not found")
    return transfer as Transfer
  }

  public async findTransfersByCursor(args: TransfersByCursorOptions): Promise<Transfer[]> {
    const { page, limit, status } = args

    const queryParams = this.prepareQueryParams({ page, limit, status })
    const { skip, take, where } = queryParams

    const transfers = await this.transfers.findMany({
      where,
      take,
      skip,
      orderBy: [
        {
          timestamp: "desc",
        },
      ],
      include: {
        ...getTransferQueryParams().include,
      },
    })

    return transfers
  }

  public async findTransferByFilterParams(args: TransfersByCursorOptions): Promise<Transfer[]> {
    const { page, limit, status, sender } = args

    const queryParams = this.prepareQueryParams({ page, limit, status, sender })
    const { skip, take, where } = queryParams

    const transfer = await this.transfers.findMany({
      where,
      take,
      skip,
      orderBy: [
        {
          timestamp: "desc",
        },
      ],
      include: {
        ...getTransferQueryParams().include,
      },
    })

    return transfer
  }
}
export default TransfersService
