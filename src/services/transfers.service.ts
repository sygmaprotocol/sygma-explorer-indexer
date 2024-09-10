/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Prisma, PrismaClient, Transfer, TransferStatus } from "@prisma/client"
import { NotFound, getTransferQueryParams } from "../utils/helpers"

export type Pagination = {
  page: number
  limit: number
}

export enum DomainType {
  Source = "source",
  Destination = "destination",
}

class TransfersService {
  public transfers = new PrismaClient().transfer
  public deposit = new PrismaClient().deposit

  private calculatePaginationParams(paginationParams: Pagination): {
    skip: number
    take: number
  } {
    const pageSize = paginationParams.limit
    const pageIndex = paginationParams.page
    const skip = (pageIndex - 1) * pageSize
    const take = pageSize

    return {
      skip,
      take,
    }
  }

  public async findTransfers(where: Prisma.TransferWhereInput, paginationParams: Pagination): Promise<Transfer[]> {
    const { skip, take } = this.calculatePaginationParams(paginationParams)
    const transfers = await this.transfers.findMany({
      where,
      take,
      skip,
      orderBy: {
        deposit: {
          timestamp: "desc",
        },
      },
      include: {
        ...getTransferQueryParams().include,
      },
    })

    return transfers
  }

  public async findAllTransfers(status: TransferStatus | undefined, paginationParams: Pagination): Promise<Transfer[]> {
    const where: Prisma.TransferWhereInput = {
      status: status,
    }

    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }

  public async findTransferById(id: string): Promise<Transfer> {
    const transfer = await this.transfers.findUnique({
      where: { id },
      include: {
        ...getTransferQueryParams().include,
      },
    })

    if (!transfer) throw new NotFound("Transfer not found")
    return transfer as Transfer
  }

  public async findTransfersByTxHash(txHash: string, domainID: number): Promise<Transfer[]> {
    let where: Prisma.DepositWhereInput
    domainID == undefined
      ? (where = { txHash: txHash })
      : (where = {
          txHash: txHash,
          transfer: {
            fromDomainId: domainID,
          },
        })

    const deposit = await this.deposit.findMany({
      where,
      include: { transfer: { include: { ...getTransferQueryParams().include } } },
    })

    if (!deposit) throw new NotFound("Transfer not found")
    const transfers = deposit.map(dep => dep.transfer)
    return transfers
  }

  public async findTransfersByAccountAddress(sender: string, status: TransferStatus | undefined, paginationParams: Pagination): Promise<Transfer[]> {
    const where: Prisma.TransferWhereInput = {
      accountId: sender,
      status: status,
    }

    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }

  public async findTransfersByResourceID(resourceID: string, status: TransferStatus | undefined, paginationParams: Pagination): Promise<Transfer[]> {
    const where: Prisma.TransferWhereInput = {
      resourceID: resourceID,
      status: status,
    }

    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }

  public async findTransfersBySourceDomainToDestinationDomain(
    sourceDomainID: number,
    destinationDomainID: number,
    paginationParams: Pagination,
  ): Promise<Transfer[]> {
    const where: Prisma.TransferWhereInput = {
      fromDomainId: sourceDomainID,
      toDomainId: destinationDomainID,
    }

    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }

  public async findTransfersByResourceBetweenDomains(
    resourceID: string,
    sourceDomainID: number,
    destinationDomainID: number,
    paginationParams: Pagination,
  ): Promise<Transfer[]> {
    const where: Prisma.TransferWhereInput = {
      resourceID: resourceID,
      fromDomainId: sourceDomainID,
      toDomainId: destinationDomainID,
    }

    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }

  public async findTransfersByDomain(
    domainID: number,
    domain: DomainType,
    status: TransferStatus | undefined,
    paginationParams: Pagination,
  ): Promise<Transfer[]> {
    let where: Prisma.TransferWhereInput

    if (domain == DomainType.Source) {
      where = { fromDomainId: domainID, status: status }
    } else if (domain == DomainType.Destination) {
      where = { toDomainId: domainID, status: status }
    } else {
      where = {
        OR: [
          { fromDomainId: domainID, status: status },
          { toDomainId: domainID, status: status },
        ],
      }
    }
    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }
}
export default TransfersService
