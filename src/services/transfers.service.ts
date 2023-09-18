import { PrismaClient, Transfer, TransferStatus } from "@prisma/client"
import { NotFound, getTransferQueryParams } from "../utils/helpers"

export type TransfersByCursorOptions = {
  page: string
  limit: string
  status?: TransferStatus
  [key: string]: string | undefined
}

export type WhereClause = { [key: string]: string | undefined }

class TransfersService {
  public transfers = new PrismaClient().transfer
  public deposit = new PrismaClient().deposit

  private prepareQueryParams(args: TransfersByCursorOptions): {
    skip: number
    take: number
    where: WhereClause
  } {
    const { page, limit, ...rest } = args

    const pageSize = parseInt(limit, 10)
    const pageIndex = parseInt(page, 10)
    const skip = (pageIndex - 1) * pageSize
    const take = pageSize

    const where = rest ? { ...rest } : ({} as TransferStatus | {})

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

  public async findTransferByTxHash({ txHash }: { txHash: string }): Promise<Transfer> {
    const deposit = await this.deposit.findFirst({
      where: { txHash },
      include: { transfer: { include: { ...getTransferQueryParams().include } } },
    })

    if (!deposit) throw new NotFound("Transfer not found")
    return deposit.transfer
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

  public async findTransferByAccountAddress(args: TransfersByCursorOptions): Promise<Transfer[]> {
    const { page, limit, status, sender } = args
    const queryParams = this.prepareQueryParams({ page, limit, status })
    const { skip, take } = queryParams

    const transfers = await this.transfers.findMany({
      where: {
        account: {
          id: sender,
        },
      },
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

  public async findTransferByResourceID(args: TransfersByCursorOptions): Promise<Transfer[]> {
    const { page, limit, status, resourceID } = args
    const queryParams = this.prepareQueryParams({ page, limit, status })
    const { skip, take } = queryParams

    const transfers = await this.transfers.findMany({
      where: {
        resourceID: resourceID
      },
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

  public async findTransferBySourceDomainToDestinationDomain(args: TransfersByCursorOptions): Promise<Transfer[]> {
    const { page, limit, sourceDomainID, destinationDomainID } = args
    const queryParams = this.prepareQueryParams({ page, limit })
    const { skip, take } = queryParams

    const transfers = await this.transfers.findMany({
      where: {
        fromDomainId: parseInt(sourceDomainID!), 
        toDomainId: parseInt(destinationDomainID!)      
      },
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

  public async findTransferByResourceBetweenDomains(args: TransfersByCursorOptions): Promise<Transfer[]> {
    const { page, limit, resourceID, sourceDomainID, destinationDomainID } = args
    const queryParams = this.prepareQueryParams({ page, limit })
    const { skip, take } = queryParams

    const transfers = await this.transfers.findMany({
      where: {
        resourceID: resourceID,
        fromDomainId: parseInt(sourceDomainID!), 
        toDomainId: parseInt(destinationDomainID!),     
      },
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
}
export default TransfersService
