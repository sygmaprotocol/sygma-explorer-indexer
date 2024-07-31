/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
export type DecodedLogs = {
  deposit: Array<DecodedDepositLog>
  proposalExecution: Array<DecodedProposalExecutionLog>
  errors: Array<DecodedFailedHandlerExecution>
}

export type DecodedDepositLog = {
  blockNumber: number
  depositNonce: number
  toDomainId: string
  sender: string[]
  destination: string
  fromDomainId: string
  resourceID: string
  txHash: string
  timestamp: number
  depositData: string
  handlerResponse: string
  transferType: string
  amount: string
  senderStatus?: string
  fee: FeeData
}

export type DecodedProposalExecutionLog = {
  blockNumber: number
  from: string
  depositNonce: number
  txHash: string
  timestamp: number
  fromDomainId: string
}

export type DecodedFailedHandlerExecution = {
  domainId: string
  depositNonce: number
  message: string
  txHash: string
  blockNumber: number
  timestamp: number
}

export type FeeData = {
  tokenAddress: string
  tokenSymbol: string
  amount: string
  decimals: number
}
export enum EventType {
  DEPOSIT = "Deposit",
  PROPOSAL_EXECUTION = "ProposalExecution",
  FAILED_HANDLER_EXECUTION = "FailedHandlerExecution",
  FEE_COLLECTED = "FeeCollected",
}

export enum FeeHandlerType {
  BASIC = "basic",
  PERCENTAGE = "percentage",
}

export enum DepositType {
  FUNGIBLE = "fungible",
  NONFUNGIBLE = "nonfungible",
  SEMIFUNGIBLE = "semifungible",
  PERMISSIONLESS_GENERIC = "permissionlessGeneric",
  PERMISSIONED_GENERIC = "permissionedGeneric",
}
