import { PrismaClient, Transfer, ProposalEvent, VoteEvent, Prisma } from "@prisma/client"

type TransferWithStatus = Transfer & {
  status?: number
  proposalEvents: ProposalEvent[]
  voteEvents: VoteEvent[]
}

type TransfersWithStatus = TransferWithStatus[]

type AllTransfersOption = {
  limit: number
  skipIndex: number
}

export type Filters = {
  fromAddress?: string,
  toAddress?: string,
  depositTransactionHash?: string,
  fromDomainId?: string,
  toDomainId?: string
}

type TransfersByCursorOptions = {
  id?: string
  first?: number
  last?: number
  before?: string
  after?: string
  filters?: Filters
}
type ForwardPaginationArguments = { first: number; after?: string }
type BackwardPaginationArguments = { last: number; before?: string }

function isForwardPagination(args: TransfersByCursorOptions): args is ForwardPaginationArguments {
  return "first" in args && args.first !== undefined
}

function isBackwardPagination(args: TransfersByCursorOptions): args is BackwardPaginationArguments {
  return "last" in args && args.last !== undefined
}

class TransfersService {
  public transfers = new PrismaClient().transfer

  public async findTransfer({ id }: { id: string }) {
    const transfer = await this.transfers.findUnique({
      where: { id },
      include: {
        proposalEvents: true,
        voteEvents: true,
      },
    })
    if (transfer) {
      return this.addLatestStatusToTransfer(transfer)
    } else {
      return null
    }
  }

  public async findTransferByTransactionHash({ hash }: { hash: string }) {
    const transfer = await this.transfers.findUnique({
      where: { depositTransactionHash: hash },
      include: {
        proposalEvents: true,
        voteEvents: true,
      },
    })
    if (transfer) {
      return this.addLatestStatusToTransfer(transfer)
    } else {
      return null
    }
  }

  public async findAllTransfes({ limit, skipIndex }: AllTransfersOption) {
    const transfers: TransfersWithStatus = await this.transfers.findMany({
      take: limit,
      skip: skipIndex,
      orderBy: [
        {
          timestamp: "desc",
        },
      ],
      include: {
        proposalEvents: true,
        voteEvents: true,
      },
    })
    return this.addLatestStatusToTransfers(transfers)
  }

  buildQueryObject(args: TransfersByCursorOptions) {
    const cursor = args.after ? { id: args.after } : undefined
    const skip = args.after ? 1 : undefined
    const take = args.first! + 1
    const filters = args.filters

    const where = {
      fromDomainId: undefined as any,
      fromAddress: undefined as any,
      toAddress: undefined as any,
      depositTransactionHash: undefined as any,
      toDomainId: undefined as any
    }

    if (filters !== undefined && Object.keys(filters).length) {
      const {
        fromAddress,
        toAddress,
        depositTransactionHash,
        fromDomainId,
        toDomainId
      } = filters as Filters

      where.fromDomainId = fromDomainId && parseInt(fromDomainId!, 10)
      where.fromAddress = fromAddress
      where.toAddress = toAddress
      where.depositTransactionHash = depositTransactionHash
      where.toDomainId = toDomainId && parseInt(toDomainId, 10)
    }

    return {
      cursor,
      take,
      skip,
      include: {
        proposalEvents: true,
        voteEvents: true,
      },
      orderBy: { timestamp: "desc" } as Prisma.Enumerable<Prisma.TransferOrderByInput>,
      where
    }
  }

  public async findTransfersByCursor(args: TransfersByCursorOptions) {
    let rawTransfers!: TransfersWithStatus
    let hasPreviousPage!: boolean
    let hasNextPage!: boolean
    if (isForwardPagination(args)) {
      const {
        cursor,
        take,
        skip,
        include,
        orderBy,
        where
      } = this.buildQueryObject(args)
      rawTransfers = await this.transfers.findMany({
        cursor,
        take,
        skip,
        orderBy,
        include,
        where
      })
      // See if we are "after" another record, indicating a previous page
      hasPreviousPage = !!args.after

      // See if we have an additional record, indicating a next page
      hasNextPage = rawTransfers.length > args.first
      // Remove the extra record (last element) from the results
      if (hasNextPage) rawTransfers.pop()
    } else if (isBackwardPagination(args)) {
      const {
        cursor,
        take,
        skip,
        include,
        orderBy,
        where
      } = this.buildQueryObject(args)
      rawTransfers = await this.transfers.findMany({
        cursor,
        take,
        skip,
        orderBy,
        include,
        where
      })
      hasNextPage = !!args.before
      hasPreviousPage = rawTransfers.length > args.last
      if (hasPreviousPage) rawTransfers.shift()
    }

    const transfers = this.addLatestStatusToTransfers(rawTransfers)
    const startCursor = transfers[0].id
    const endCursor = transfers[transfers.length - 1].id
    return {
      transfers,
      pageInfo: {
        hasPreviousPage,
        hasNextPage,
        startCursor,
        endCursor,
      },
    }
  }

  addLatestStatusToTransfers(transfers: TransfersWithStatus) {
    return transfers.map(transfer => this.addLatestStatusToTransfer(transfer))
  }

  addLatestStatusToTransfer(transfer: TransferWithStatus) {
    if (transfer.proposalEvents && transfer.proposalEvents.length > 0) {
      const reducedProps:{[key: string]: number} = transfer.proposalEvents.reduce((acc: any, value) => {
        // Group initialization
        if (!acc[value.timestamp]) {
          acc[value.timestamp] = []
        }

        // Grouping
        acc[value.timestamp] = Math.max(acc[value.timestamp], value.proposalStatus)

        return acc
      }, {})
      const finalStatus = Math.max(...Object.values(reducedProps))
      transfer.status = finalStatus
    } else {
      // Active status by default
      transfer.status = 1
    }

    return transfer
  }
}
export default TransfersService
