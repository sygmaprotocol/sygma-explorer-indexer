/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Transfer } from "@prisma/client"

export interface IFixInterface {
  executeTransferAction: (transfer: Transfer) => void
}
