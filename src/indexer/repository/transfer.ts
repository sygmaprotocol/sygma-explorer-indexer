import { PrismaClient, Transfer, TransferStatus } from "@prisma/client"
import { ObjectId } from "mongodb"
import { DecodedDepositLog, DecodedFailedHandlerExecution, DecodedProposalExecutionLog } from "../services/evmIndexer/evmTypes"

export type TransferMetadataeta = {
  id: string
  depositNonce: number
  sender: string
  amount: string
  destination: string
  fromDomainId: string
  toDomainId: string
  resourceID: string

  resource: {
    connect: {
      id: string
    }
  }
  fromDomain: {
    connect: {
      id: string
    }
  }
  toDomain: {
    connect: {
      id: string
    }
  }
}
class TransferRepository {
  public transfer = new PrismaClient().transfer

  public async insertDepositTransfer(decodedLog: DecodedDepositLog): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: decodedLog.depositNonce,
      sender: decodedLog.sender,
      amount: decodedLog.amount,
      destination: decodedLog.destination,
      status: TransferStatus.pending,
      resource: {
        connect: {
          id: decodedLog.resourceID,
        },
      },
      fromDomain: {
        connect: {
          id: decodedLog.fromDomainId,
        },
      },
      toDomain: {
        connect: {
          id: decodedLog.toDomainId,
        },
      },
      timestamp: new Date(decodedLog.timestamp * 1000),
    }
    return await this.transfer.create({ data: transferData })
  }

  public async insertSubstrateDepositTransfer(
    substrateDepositData: any
  ): Promise<Transfer> {
    console.log("🚀 ~ file: transfer.ts:66 ~ TransferRepository ~ substrateDepositData:", substrateDepositData)
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: substrateDepositData.depositNonce,
      sender: substrateDepositData.sender,
      amount: substrateDepositData.amount,
      status: TransferStatus.pending,
      resource: {
        connect: {
          id: substrateDepositData.resourceID,
        },
      },
      fromDomain: {
        connect: {
          id: substrateDepositData.fromDomainId,
        },
      },
      toDomain: {
        connect: {
          id: substrateDepositData.toDomainId,
        },
      },
      timestamp: new Date(substrateDepositData.timestamp),
    }

    const t = await this.transfer.create({ data: transferData })
    console.log("🚀 ~ file: transfer.ts:93 ~ TransferRepository ~ t:", t)

    return t
  }

  public async insertExecutionTransfer({
    depositNonce,
    fromDomainId,
    timestamp,
    resourceID,
  }: Pick<DecodedProposalExecutionLog, "depositNonce" | "fromDomainId" | "timestamp" | "resourceID">): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: depositNonce,
      fromDomainId: fromDomainId,
      timestamp: new Date(timestamp * 1000),
      status: TransferStatus.executed,
      resourceID: resourceID,
      toDomainId: null,
      sender: null,
      destination: null,
      amount: null,
    }
    return await this.transfer.create({ data: transferData })
  }

  public async insertFailedTransfer({ depositNonce, domainId }: Pick<DecodedFailedHandlerExecution, "depositNonce" | "domainId">): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: depositNonce,
      fromDomainId: domainId,
      status: TransferStatus.failed,
    }
    return await this.transfer.create({ data: transferData })
  }

  public async updateTransfer(
    {
      depositNonce,
      sender,
      amount,
      destination,
      resourceID,
      fromDomainId,
      toDomainId,
      timestamp,
    }: Pick<DecodedDepositLog, "depositNonce" | "sender" | "amount" | "destination" | "resourceID" | "fromDomainId" | "toDomainId" | "timestamp">,
    id: string,
  ): Promise<Transfer> {
    const transferData = {
      depositNonce: depositNonce,
      sender: sender,
      amount: amount,
      destination: destination,
      resourceID: resourceID,
      fromDomainId: fromDomainId,
      toDomainId: toDomainId,
      timestamp: new Date(timestamp),
    }
    console.log("🚀 ~ file: transfer.ts:161 ~ TransferRepository ~ transferData:", transferData)

    return await this.transfer.update({ where: { id: id }, data: transferData })
  }

  public async findByNonceFromDomainId(nonce: number, fromDomainId: string): Promise<Transfer | null> {
    return await this.transfer.findFirst({
      where: {
        depositNonce: nonce,
        fromDomainId: fromDomainId,
      },
    })
  }

  public async findByNonceToDomainId(nonce: number, toDomainId: string): Promise<Transfer | null> {
    return await this.transfer.findFirst({
      where: {
        depositNonce: nonce,
        toDomainId: toDomainId,
      },
    })
  }

  public async updateStatus(status: TransferStatus, id: string): Promise<Transfer> {
    return await this.transfer.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    })
  }
}

export default TransferRepository
