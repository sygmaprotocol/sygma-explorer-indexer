import { TransferStatus } from "@prisma/client"

export interface ITransfer {
  page: string
  limit: string
  status?: TransferStatus
}

export interface ITransferById {
  id: string
}

export interface ITransferBySender extends ITransfer {
  senderAddress: string
}

export type IncludedQueryParams = {
  include: {
    resource: {
      select: {
        type: boolean
        id: boolean
      }
    }
    toDomain: {
      select: {
        name: boolean
        lastIndexedBlock: boolean
        id: boolean
      }
    }
    fromDomain: {
      select: {
        name: boolean
        lastIndexedBlock: boolean
        id: boolean
      }
    }
    fee: {
      select: {
        amount: boolean
        tokenAddress: boolean
        tokenSymbol: boolean
      }
    }
    deposit: {
      select: {
        txHash: boolean
        blockNumber: boolean
        depositData: boolean
        handlerResponse: boolean
      }
    }
  }
}
