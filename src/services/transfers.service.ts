// @ts-nocheck
import { PrismaClient, Transfer, ProposalExecutionEvent, FailedHandlerExecutionEvent, Prisma } from "@prisma/client"

type TransferWithStatus = Transfer & {
  status?: number
  proposalExecutionEvent: ProposalExecutionEvent | null
  failedHandlerExecutionEvent: FailedHandlerExecutionEvent | null
}

type TransfersWithStatus = TransferWithStatus[]

type AllTransfersOption = {
  page: string;
  limit: string;
  status?: string;
}

export type Filters = {
  fromAddress?: string,
  toAddress?: string,
  depositTransactionHash?: string,
  fromDomainId?: string,
  toDomainId?: string
}

export type TransfersByCursorOptions = {
  page: string;
  limit: string;
  status?: string;
};

class TransfersService {
  public transfers = new PrismaClient().transfer
  private currentPage: number;
  private currentLimit: number;
  private currentCursor: string;

  public async findTransfer({ id }: { id: string }) {
    const transfer = await this.transfers.findUnique({
      where: { id }
    })
    if (transfer) {
      return this.addLatestStatusToTransfer(transfer)
    } else {
      throw new Error('No transfer found')
    }
  }

  private isForwardPagination(page: number): boolean {
    const isForward = this.currentPage && page > this.currentPage;
    return isForward
  }

  private isBackwardPagination(page: number) {
    const isBackward = this.currentPage && page < this.currentPage;
    return isBackward;
  }

  public async findAllTransfes({ page, limit, status }: AllTransfersOption) {
    this.currentPage = parseInt(page, 10);
    const transfers = await this.transfers.findMany({
      take: limit,
      orderBy: [
        {
          timestamp: "asc",
        },
      ],
      include: {
        ...returnQueryParamsForTransfers().include,
      }
    })
    // FOR PAGINATION USAGE
    this.currentCursor = transfers[transfers.length - 1].id;
    return this.addLatestStatusToTransfers(transfers)
  }

  buildQueryObject(args: TransfersByCursorOptions) {
    const { filters } = args

    const where = {
      fromDomainId: undefined as any,
      fromAddress: undefined as any,
      toAddress: undefined as any,
      depositTransactionHash: undefined as any,
      toDomainId: undefined as any,
      OR: undefined as any
    }

    if (filters !== undefined && Object.keys(filters).length) {
      const {
        fromAddress,
        toAddress,
        depositTransactionHash,
        fromDomainId,
        toDomainId
      } = filters as Filters

      where.OR = fromAddress && toAddress && [
        {
          fromAddress: { equals: fromAddress, mode: "insensitive" },
        },
        {
          toAddress: { equals: toAddress, mode: "insensitive" },
        },
      ]

      where.fromDomainId = fromDomainId && parseInt(fromDomainId!, 10)
      where.depositTransactionHash = depositTransactionHash
      where.toDomainId = toDomainId && parseInt(toDomainId, 10)
    }

    return {
      orderBy: { timestamp: "desc" } as Prisma.Enumerable<Prisma.TransferOrderByWithRelationInput>,
      where
    }
  }

  public async findTransfersByCursor(args: TransfersByCursorOptions) {
    const { page, limit, status } = args;

      // See if we have an additional record, indicating a next page
      hasNextPage = rawTransfers.length > args.first
      // Remove the extra record (last element) from the results
      if (hasNextPage) rawTransfers.pop()
    } else if (isBackwardPagination(args)) {
      const take = -1 * (args.last + 1)
      const cursor = args.before ? { id: args.before } : undefined
      const skip = cursor ? 1 : undefined
      const {
        orderBy,
        where
      } = this.buildQueryObject(args)
      rawTransfers = await this.transfers.findMany({
        cursor,
        take,
        skip,
        orderBy,
        where
      })
      hasNextPage = !!args.before
      hasPreviousPage = rawTransfers.length > args.last
      if (hasPreviousPage) rawTransfers.shift()
    }

    this.currentPage = pageNumber;
    this.currentLimit = limitNumber;

    const transfers = await this.transfers.findMany({
      take: this.currentLimit,
      // skip: this.currentLimit,
      orderBy: [{
        timestamp: "asc",
      }],
      include: {
        ...returnQueryParamsForTransfers().include
      }
    })

    if(transfers.length){
      this.currentCursor = transfers[transfers.length - 1].id;
    }

  }

  addLatestStatusToTransfers(transfers: TransfersWithStatus) {
    return transfers.map(transfer => this.addLatestStatusToTransfer(transfer))
  }

  addLatestStatusToTransfer(transfer: TransferWithStatus) {
    if (transfer.proposalExecutionEvent) {
      transfer.status = 1
    }

    return transfer
  }
}
export default TransfersService
