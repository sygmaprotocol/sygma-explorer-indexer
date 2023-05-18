import { TransferStatus } from "@prisma/client"

export interface ITransfer {
  page: string
  limit: string
  status?: TransferStatus
}

export interface ITransferById {
  id: string
}
