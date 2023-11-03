/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { PrismaClient, Transfer, TransferStatus } from "@prisma/client"
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

  public async findTransfers(where: Partial<Transfer>, paginationParams: Pagination): Promise<Transfer[]> {
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
    const where: Partial<Transfer> = {
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

  public async findTransferByTxHash(txHash: string, domainID: number): Promise<Transfer> {
    let where: Partial<any>
    domainID == undefined
      ? (where = { txHash: txHash })
      : (where = {
          txHash: txHash,
          transfer: {
            fromDomainId: domainID,
          },
        })

    const deposit = await this.deposit.findFirst({
      where,
      include: { transfer: { include: { ...getTransferQueryParams().include } } },
    })

    if (!deposit) throw new NotFound("Transfer not found")
    return deposit.transfer
  }

  public async findTransfersByAccountAddress(sender: string, status: TransferStatus | undefined, paginationParams: Pagination): Promise<Transfer[]> {
    const where: Partial<Transfer> = {
      accountId: sender,
      status: status,
    }

    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }

  public async findTransfersByResourceID(resourceID: string, status: TransferStatus | undefined, paginationParams: Pagination): Promise<Transfer[]> {
    const where: Partial<Transfer> = {
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
    const where: Partial<Transfer> = {
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
    const where: Partial<Transfer> = {
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
    let where: Partial<Transfer>

    domain == DomainType.Source ? (where = { fromDomainId: domainID, status: status }) : (where = { toDomainId: domainID, status: status })

    const transfers = this.findTransfers(where, paginationParams)

    return transfers
  }
}
export default TransfersService
