import { PrismaClient, Transfer, TransferStatus } from "@prisma/client"
import { getTransferQueryParams } from "../utils/helpers"

export type Filters = {
  fromAddress?: string
  toAddress?: string
  depositTransactionHash?: string
  fromDomainId?: string
  toDomainId?: string
}

export type TransfersByCursorOptions = {
  page: string
  limit: string
  status?: TransferStatus
}

class TransfersService {
  public transfers = new PrismaClient().transfer
  private currentCursor: string | undefined

  public async findTransferById({ id }: { id: string }): Promise<Transfer> {
    try {
      const transfer = await this.transfers.findUnique({
        where: { id },
        include: {
          ...getTransferQueryParams().include,
        },
      })
      return transfer as Transfer
    } catch (error) {
      throw new Error("No transfer found")
    }
  }

  public async findTransfersByCursor(args: TransfersByCursorOptions): Promise<Transfer[]> {
    const { page, limit, status } = args

    const pageSize = parseInt(limit, 10)
    const pageIndex = parseInt(page, 10) - 1
    const skip = pageIndex * pageSize

    const where = status ? { status } : {}

    const transfers = await this.transfers.findMany({
      where,
      take: pageSize + 1,
      skip: this.currentCursor ? 0 : skip,
      cursor: this.currentCursor ? { id: this.currentCursor } : undefined,
      orderBy: [
        {
          timestamp: "asc",
        },
      ],
      include: {
        ...getTransferQueryParams().include,
      },
    })

    const transferWithoutTheLastItem = transfers.slice(0, pageSize)

    this.currentCursor = transferWithoutTheLastItem[transfers.length - 1]?.id

    return transferWithoutTheLastItem
  }
}
export default TransfersService
