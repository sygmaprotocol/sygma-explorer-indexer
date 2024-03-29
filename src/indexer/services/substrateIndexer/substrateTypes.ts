/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { XcmAssetId } from "@polkadot/types/interfaces"

export type RawProposalExecutionData = { originDomainId: string; depositNonce: string; dataHash: string }

export type RawDepositData = {
  destDomainId: string
  resourceId: string
  depositNonce: string
  sender: string
  transferType: string
  depositData: string
  handlerResponse: string
}

export type RawFeeCollectedData = {
  feePayer: string
  resourceId: string
  feeAmount: string
  destDomainId: string
  feeAssetId: XcmAssetId
}

export type RawFailedHandlerExecutionData = Omit<RawProposalExecutionData, "dataHash"> & { error: string }

export type ProposalExecutionDataToSave = Omit<RawProposalExecutionData, "dataHash"> & {
  txIdentifier: string
  blockNumber: string
  timestamp: number
}

export type FeeCollectedDataToSave = RawFeeCollectedData & {
  txIdentifier: string
}

export type FailedHandlerExecutionToSave = Omit<RawProposalExecutionData, "dataHash"> & {
  error: string
  txIdentifier: string
  blockNumber: string
  timestamp: number
}

export type DepositDataToSave = RawDepositData & { txIdentifier: string; blockNumber: string; timestamp: number }

export type ProposalExecutionEvent = {
  phase: {
    asApplyExtrinsic: number
  }
  event: {
    toHuman: () => {
      data: RawProposalExecutionData
    }
  }
}

export type DepositEvent = {
  phase: {
    asApplyExtrinsic: number
  }
  event: {
    toHuman: () => {
      data: RawDepositData
    }
  }
}

export type FailedHandlerExecutionEvent = {
  phase: {
    asApplyExtrinsic: number
  }
  event: {
    toHuman: () => {
      data: RawFailedHandlerExecutionData
    }
  }
}

export type FeeCollectedEvent = {
  phase: {
    asApplyExtrinsic: number
  }
  event: {
    toHuman: () => {
      data: RawFeeCollectedData
    }
  }
}

export type SubstrateEvent = {
  event: {
    method: string
    section: string
  }
}

export enum SygmaPalleteEvents {
  ProposalExecution = "ProposalExecution",
  Deposit = "Deposit",
  FailedHandlerExecution = "FailedHandlerExecution",
  FeeCollected = "FeeCollected",
}

export enum SubstrateTypeTransfer {
  Fungible = "fungible",
}
