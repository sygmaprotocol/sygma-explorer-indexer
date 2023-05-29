/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
// @ts-nocheck
import { PrismaClient, Transfer, ProposalExecutionEvent, FailedHandlerExecutionEvent, Prisma } from "@prisma/client"

type TransferWithStatus = Transfer & {
  status?: number
  proposalExecutionEvent: ProposalExecutionEvent | null
  failedHandlerExecutionEvent: FailedHandlerExecutionEvent | null
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

export type TransfersByCursorOptions = {
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
      where: { id }
    })
    if (transfer) {
      return this.addLatestStatusToTransfer(transfer)
    } else {
      throw new Error('No transfer found')
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
    let rawTransfers!: TransfersWithStatus
    let hasPreviousPage!: boolean
    let hasNextPage!: boolean
    if (isForwardPagination(args)) {
      const cursor = args.after ? { id: args.after } : undefined
      const skip = args.after ? 1 : undefined
      const take = args.first + 1
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

    let transfers: Array<TransferWithStatus> = []
    let startCursor: string = ""
    let endCursor: string = ""

    if (rawTransfers.length) {
      transfers = this.addLatestStatusToTransfers(rawTransfers)
      startCursor = transfers[0].id
      endCursor = transfers[transfers.length - 1].id
    }

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
    if (transfer.proposalExecutionEvent) {
      transfer.status = 1
    }

    return transfer
  }
}
export default TransfersService
