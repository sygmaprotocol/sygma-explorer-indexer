// @ts-nocheck
import { PrismaClient, Transfer, ProposalExecutionEvent, FailedHandlerExecutionEvent, Prisma } from "@prisma/client"
import { returnQueryParamsForTransfers } from "../utils/helpers"

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
  // default settings
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

    const pageSize = parseInt(limit, 10);
    const pageIndex = parseInt(page, 10) - 1;
    const skip = pageIndex * pageSize;

    const where = status ? { status } : { };

    const transfers = await this.transfers.findMany({
      where,
      take: pageSize + 1,
      skip: this.currentCursor ? 0 : skip,
      cursor: this.currentCursor ? { id: this.currentCursor } : undefined,
      orderBy: [{
        timestamp: "asc",
      }],
      include: {
        ...returnQueryParamsForTransfers().include
      }
    })

    const transferWithoutTheLastItem = transfers.slice(0, pageSize)

    return transferWithoutTheLastItem;
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
