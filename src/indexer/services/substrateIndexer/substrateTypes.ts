export type RawProposalExecutionData = { originDomainId: string; depositNonce: string; dataHash: string }

export type RawDepositData = {
  destDomainId: string,
  resourceId: string,
  depositNonce: string,
  sender: string,
  transferType: string,
  depositData: string,
  handlerResponse: string,
}

export type ProposalExecutionDataToSave = Omit<RawProposalExecutionData, "dataHash"> & { txIdentifier: string, blockNumber: string, timestamp: number }

export type DepositDataToSave = RawDepositData & { txIdentifier: string, blockNumber: string, timestamp: number }

export type ProposalExecutionEvent = { event: { data: RawProposalExecutionData } }

export type DepositEvent = {
  event: {
    data: RawDepositData
  }
}

export type SubstrateEvent = {
  event: {
    method: string,
    section: string
  }
}

export enum SygmaPalleteEvents {
  ProposalExecution = "ProposalExecution",
  Deposit = "Deposit",
}

