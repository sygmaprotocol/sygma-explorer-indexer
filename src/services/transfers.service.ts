import { PrismaClient, Transfer, ProposalEvent, VoteEvent } from "@prisma/client"

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

type TransfersByCursorOptions = {
  id?: string
  first?: number
  last?: number
  before?: string
  after?: string
}
type ForwardPaginationArguments = { first: number; after?: string }
type BackwardPaginationArguments = { last: number; before?: string }

function isForwardPagination(args: TransfersByCursorOptions): args is ForwardPaginationArguments {
  return "first" in args && args.first !== undefined
}

function isBackwardPagination(args: TransfersByCursorOptions): args is BackwardPaginationArguments {
  return "last" in args && args.last !== undefined
}

class TransfesService {
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

  public async findTransfersByCursor(args: TransfersByCursorOptions) {
    let rawTransfers!: TransfersWithStatus
    let hasPreviousPage!: boolean
    let hasNextPage!: boolean
    if (isForwardPagination(args)) {
      const cursor = args.after ? { id: args.after } : undefined
      const skip = args.after ? 1 : undefined
      const take = args.first + 1
      rawTransfers = await this.transfers.findMany({
        cursor,
        take,
        skip,
        orderBy: { id: "desc" },
        include: {
          proposalEvents: true,
          voteEvents: true,
        },
      })
      // See if we are "after" another record, indicating a previous page
      hasPreviousPage = !!args.after

      // See if we have an additional record, indicating a next page
      hasNextPage = rawTransfers.length > args.first
      // Remove the extra record (last element) from the results
      if (hasNextPage) rawTransfers.pop()
    } else if (isBackwardPagination(args)) {
      const take = -1 * (args.last + 1)
      const cursor = args.before ? { id: args.before } : undefined
      const skip = cursor ? 1 : undefined
      rawTransfers = await this.transfers.findMany({
        cursor,
        take,
        skip,
        orderBy: { id: "desc" },
        include: {
          proposalEvents: true,
          voteEvents: true,
        },
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
    const allEqual = (arr: ProposalEvent[]) => arr.every(v => v.timestamp === arr[0].timestamp)
    if (transfer.proposalEvents && transfer.proposalEvents.length > 0) {
      let proposalStatus
      if (allEqual(transfer.proposalEvents)) {
        proposalStatus = [...transfer.proposalEvents].sort((a, b) => parseInt(b.id.valueOf(), 16) - parseInt(a.id.valueOf(), 16))[0].proposalStatus
      } else {
        proposalStatus = [...transfer.proposalEvents].sort((a, b) => b.timestamp - a.timestamp)[0].proposalStatus
      }
      transfer.status = proposalStatus
    } else {
      // Active status by default
      transfer.status = 1
    }
    return transfer
  }
}
export default TransfesService
