import { BitcoinResource } from "indexer/config"

export type Block = {
  hash: string
  confirmations: number
  height: number
  time: number
  nonce: number
  nTx: number
  tx: Transaction[]
}

export type Transaction = {
  txid: string
  hash: string
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
  originDomainId: number
  depositNonce: number
}

export enum BitcoinTypeTransfer {
  Fungible = "fungible",
}
