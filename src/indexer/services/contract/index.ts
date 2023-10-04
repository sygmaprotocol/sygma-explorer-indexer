/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import {
  Bridge as BridgeType,
  BasicFeeHandler as BasicFeeHandlerType,
  DynamicERC20FeeHandlerEVM as FeeHandlerWithOracleType,
  ERC20Handler as ERC20HandlerType,
  ERC721Handler as ERC721HandlerType,
  PermissionlessGenericHandler as GenericHandlerType,
} from "@buildwithsygma/sygma-contracts"
import { Contract } from "ethers"

export * from "./contract"
export type Bridge = BridgeType & Contract
export type BasicFeeHandler = BasicFeeHandlerType & Contract
export type FeeHandlerWithOracle = FeeHandlerWithOracleType & Contract
export type ERC20Handler = ERC20HandlerType & Contract
export type ERC721Handler = ERC721HandlerType & Contract
export type GenericHandler = GenericHandlerType & Contract
