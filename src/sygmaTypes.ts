/**
 * The Licensed Work is (c) 2023 Sygma
 * SPDX-License-Identifier: LGPL-3.0-only
 */
import { ERC20Handler, ERC721Handler } from "@buildwithsygma/sygma-contracts"

export type HandlersMap = {
  [key: string]: ERC20Handler | ERC721Handler
}
