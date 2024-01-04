/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { logger } from "../utils/logger"
import TransfersService from "../services/transfers.service"
import { IFixInterface } from "./interfaces"

export async function fixDatabaseEntries(object: IFixInterface): Promise<void> {
  const transfersService = new TransfersService()

  let transfers = []
  const limit = 50
  let page = 1
  for (;;) {
    transfers = await transfersService.findTransfers({}, { limit, page })
    if (transfers.length == 0) {
      break
    }
    page++

    for (const transfer of transfers) {
      try {
        object.executeTransferAction(transfer)
      } catch (err) {
        logger.error(`Error on ${transfer.id}`, err)
      }
    }
  }
}
