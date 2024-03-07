/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Deposit, Prisma, PrismaClient, Transfer, TransferStatus } from "@prisma/client"
import { ObjectId } from "mongodb"
import { DecodedDepositLog, DecodedFailedHandlerExecution, DecodedProposalExecutionLog } from "../services/evmIndexer/evmTypes"

export type TransferWithDeposit = Prisma.TransferGetPayload<{
  include: {
    deposit: true
  }
}>

export type TransferMetadata = {
  id: string
  depositNonce: number
  amount: string
  destination: string
  fromDomainId: string
  toDomainId: string
  resourceID: string
  securityModel: number
  timestamp: Date
  deposit: Deposit
  resource: {
    connect: {
      id: string
    }
  }
  fromDomain: {
    connect: {
      id: number
    }
  }
  toDomain: {
    connect: {
      id: number
    }
  }
  account?: {
    connect: {
      id: string
    }
  }
}
class TransferRepository {
  public transfer = new PrismaClient().transfer

  public async insertDepositTransfer(decodedLog: DecodedDepositLog & { usdValue: number | null }): Promise<Transfer> {
    const transferData = {
      depositNonce: decodedLog.depositNonce,
      amount: decodedLog.amount,
      destination: decodedLog.destination,
      status: TransferStatus.pending,
      message: "",
      resource: {
        connect: {
          id: decodedLog.resourceID,
        },
      },
      fromDomain: {
        connect: {
          id: Number(decodedLog.fromDomainId),
        },
      },
      toDomain: {
        connect: {
          id: Number(decodedLog.toDomainId),
        },
      },
      usdValue: decodedLog.usdValue,
      securityModel: decodedLog.securityModel,
    }

    return await this.transfer.upsert({
      where: {
        transferId: {
          depositNonce: decodedLog.depositNonce,
          fromDomainId: Number(decodedLog.fromDomainId),
          toDomainId: Number(decodedLog.toDomainId),
        },
      },
      update: {
        ...transferData,
        account: {
          connect: {
            id: decodedLog.sender,
          },
        },
      },
      create: {
        id: new ObjectId().toString(),
        ...transferData,
        account: {
          connect: {
            id: decodedLog.sender,
          },
        },
      },
    })
  }

  public async insertSubstrateDepositTransfer(
    substrateDepositData: Pick<
      DecodedDepositLog,
      "depositNonce" | "sender" | "amount" | "destination" | "resourceID" | "toDomainId" | "fromDomainId" | "securityModel"
    > & { usdValue: number },
  ): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: substrateDepositData.depositNonce,
      amount: substrateDepositData.amount,
      destination: substrateDepositData.destination,
      status: TransferStatus.pending,
      message: "",
      resource: {
        connect: {
          id: substrateDepositData.resourceID,
        },
      },
      fromDomain: {
        connect: {
          id: Number(substrateDepositData.fromDomainId),
        },
      },
      toDomain: {
        connect: {
          id: Number(substrateDepositData.toDomainId),
        },
      },
      account: {
        connect: {
          id: substrateDepositData.sender,
        },
      },
      usdValue: substrateDepositData.usdValue,
      securityModel: substrateDepositData.securityModel || 1,
    }

    return await this.transfer.create({ data: transferData })
  }

  public async insertExecutionTransfer(
    { depositNonce, fromDomainId }: Pick<DecodedProposalExecutionLog, "depositNonce" | "fromDomainId">,
    toDomainId: number,
  ): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: depositNonce,
      message: "",
      status: TransferStatus.executed,
      destination: null,
      amount: null,
      toDomainId: undefined,
      fromDomain: {
        connect: {
          id: Number(fromDomainId),
        },
      },
      toDomain: {
        connect: {
          id: toDomainId,
        },
      },
    } as unknown as Transfer

    return await this.transfer.create({ data: transferData })
  }

  public async insertFailedTransfer(
    { depositNonce, domainId, message }: Pick<DecodedFailedHandlerExecution, "depositNonce" | "domainId" | "message">,
    toDomainId: number,
  ): Promise<Transfer> {
    const transferData = {
      id: new ObjectId().toString(),
      depositNonce: depositNonce,
      fromDomain: {
        connect: {
          id: Number(domainId),
        },
      },
      toDomain: {
        connect: {
          id: toDomainId,
        },
      },
      status: TransferStatus.failed,
      message,
      securityModel: 1,
    }
    return await this.transfer.create({ data: transferData })
  }

  public async updateTransfer(
    {
      depositNonce,
      amount,
      destination,
      resourceID,
      fromDomainId,
      toDomainId,
      sender,
      usdValue,
      securityModel,
    }: Pick<
      DecodedDepositLog,
      "depositNonce" | "sender" | "amount" | "destination" | "resourceID" | "fromDomainId" | "toDomainId" | "securityModel"
    > & {
      usdValue: number | null
    },
    id: string,
  ): Promise<Transfer> {
    const transferData = {
      depositNonce: depositNonce,
      amount: amount,
      destination: destination,
      resource: {
        connect: {
          id: resourceID,
        },
      },
      fromDomain: {
        connect: {
          id: Number(fromDomainId),
        },
      },
      toDomain: {
        connect: {
          id: Number(toDomainId),
        },
      },
      account: {
        connect: {
          id: sender,
        },
      },
      usdValue: usdValue,
      securityModel: securityModel,
    } as Pick<TransferMetadata, "depositNonce" | "amount" | "destination" | "resource" | "fromDomain" | "toDomain" | "account" | "securityModel">
    return await this.transfer.update({ where: { id: id }, data: transferData })
  }

  public async findTransfer(nonce: number, fromDomainId: number, toDomainId: number): Promise<Transfer | null> {
    return await this.transfer.findFirst({
      where: {
        depositNonce: nonce,
        fromDomainId: fromDomainId,
        toDomainId: toDomainId,
      },
    })
  }

  public async updateStatus(status: TransferStatus, id: string, message: string): Promise<Transfer> {
    return await this.transfer.update({
      where: {
        id: id,
      },
      data: {
        status: status,
        message,
      },
    })
  }

  public async findTransfersByStatus(status: TransferStatus): Promise<Array<TransferWithDeposit>> {
    return await this.transfer.findMany({
      where: {
        status: status,
      },
      include: {
        deposit: true,
      },
    })
  }
}

export default TransferRepository
