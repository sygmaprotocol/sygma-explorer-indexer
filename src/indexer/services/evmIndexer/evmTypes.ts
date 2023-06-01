import { CeloProvider } from "@celo-tools/celo-ethers-wrapper"
import { BaseProvider } from "@ethersproject/providers"

export type DecodedFeeDistributedLog = {
  tokenAmount: string
  timestamp: Date
  blockNumber: number
  withdrawalCollector: string
  from: string
  resourceID: string
  tokenName: string
  tokenSymbol: string
  tokenContract: string
  tokenDecimals: number
}

export type ExtendedBaseProvider = BaseProvider & CeloProvider
export type DecodedLogs = {
  deposit: Array<DecodedDepositLog>
  proposalExecution: Array<DecodedProposalExecutionLog>
  errors: Array<DecodedFailedHandlerExecution>
  feeCollected: Array<DecodedFeeCollectedLog>
}

export type DecodedDepositLog = {
  blockNumber: number
  depositNonce: number
  toDomainId: string
  sender: string
  destination: string
  fromDomainId: string
  resourceID: string
  txHash: string
  timestamp: number
  depositData: string
  handlerResponse: string
  transferType: string
  amount: string
}

export type DecodedProposalExecutionLog = {
  blockNumber: number
  from: string
  depositNonce: number
  txHash: string
  timestamp: number
  resourceID: string

  transferType: string
  fromDomainId: string
}

export type DecodedFailedHandlerExecution = {
  domainId: string
  depositNonce: number
  txHash: string
  blockNumber: number
}

export type DecodedFeeCollectedLog = {
  tokenAddress: string
  tokenSymbol: string
  amount: string
  txHash: string
}
export enum EventType {
  DEPOSIT = "Deposit",
  PROPOSAL_EXECUTION = "ProposalExecution",
  FAILED_HANDLER_EXECUTION = "FailedHandlerExecution",
  FEE_COLLECTED = "FeeCollected",
}

export enum FeeHandlerType {
  BASIC = "basic",
  ORACLE = "oracle",
}
