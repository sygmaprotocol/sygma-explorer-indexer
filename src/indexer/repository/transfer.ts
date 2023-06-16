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

  public async insertDepositTransfer(decodedLog: DecodedDepositLog, addressStatus: string): Promise<Transfer> {
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
      timestamp: decodedLog.timestamp,
      addressStatus,
    }
    return await this.transfer.create({ data: transferData })
  }

  public async insertExecutionTransfer(decodedLog: DecodedProposalExecutionLog): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: decodedLog.depositNonce,
      fromDomainId: decodedLog.fromDomainId,
      timestamp: decodedLog.timestamp,
      status: TransferStatus.executed,
      resourceID: decodedLog.resourceID,
      toDomainId: null,
      sender: null,
      destination: null,
      amount: null,
    }
    return await this.transfer.create({ data: transferData })
  }

  public async insertFailedTransfer(decodedLog: DecodedFailedHandlerExecution): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: decodedLog.depositNonce,
      fromDomainId: decodedLog.domainId,
      status: TransferStatus.failed,
    }
    return await this.transfer.create({ data: transferData })
  }

  public async updateTransfer(decodedLog: DecodedDepositLog, id: string, addressStatus: string): Promise<Transfer> {
    const transferData = {
      depositNonce: decodedLog.depositNonce,
      sender: decodedLog.sender,
      amount: decodedLog.amount,
      destination: decodedLog.destination,
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
      timestamp: decodedLog.timestamp,
      addressStatus,
    }
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
