/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { TransferStatus } from "@prisma/client"
import { DomainType } from "services/transfers.service"

export interface ITransfer {
  page: number
  limit: number
  status?: TransferStatus
}

export interface ITransferById {
  id: string
}

export interface ITransferByTxHash {
  txHash: string
}

export interface ITransferByTxHashAndDomain {
  txHash: string
  domainID: number
}

export interface ITransferBySender extends ITransfer {
  senderAddress: string
}

export interface ITransferByResource extends ITransfer {
  resourceID: string
}

export interface ITransferBySourceDomainToDestinationDomain extends ITransfer {
  sourceDomainID: number
  destinationDomainID: number
}

export interface ITransferByResourceBetweenDomains extends ITransfer, ITransferByResource, ITransferBySourceDomainToDestinationDomain {}

export interface ITransferByDomain extends ITransfer {
  domainID: number
}

export interface ITransferByDomainQuery extends ITransfer {
  domain: DomainType
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
      include: {
        resource: boolean
      }
    }
    deposit: {
      select: {
        txHash: boolean
        blockNumber: boolean
        depositData: boolean
        handlerResponse: boolean
        timestamp: boolean
      }
    }
    execution: {
      select: {
        txHash: boolean
        blockNumber: boolean
        timestamp: boolean
      }
    }
    account: {
      select: {
        addressStatus: boolean
      }
    }
  }
}
