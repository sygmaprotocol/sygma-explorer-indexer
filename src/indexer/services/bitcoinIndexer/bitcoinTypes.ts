/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { BitcoinResource } from "indexer/config"

export type Block = {
  hash: string
  height: number
  mediantime: number
  tx: Transaction[]
}

export type Transaction = {
  txid: string
  vin: TxInput[]
  vout: TxOutput[]
  fee: number
}

export type TxInput = {
  txid: string
  vout: number
}

export type TxOutput = {
  value: number
  scriptPubKey: TxScript
}

export type TxScript = {
  hex: string
  address: string
  type: string
}

export type DecodedDeposit = {
  resource: BitcoinResource
  amount: bigint
  data: string
  feeAmount: bigint
}

export type DecodedExecution = {
  depositNonce: number
  sourceDomain: number
}

export enum BitcoinTypeTransfer {
  Fungible = "fungible",
}
