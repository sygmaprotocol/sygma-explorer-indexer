/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { logger } from "../utils/logger"
import { SharedConfig, getSharedConfig } from "../indexer/config"
import TransferRepository from "../indexer/repository/transfer"
import CoinMarketCapService from "../indexer/services/coinmarketcap/coinmarketcap.service"
import TransfersService from "../services/transfers.service"

const coinMarketCapAPIKey = process.env.COINMARKETCAP_API_KEY || ""
const coinMarketCapUrl = process.env.COINMARKETCAP_API_URL || ""

function getTokenSymbol(sharedConfig: SharedConfig, fromDomainId: number, resourceId: string): string {
  const currentDomain = sharedConfig.domains.find(domain => domain.id == fromDomainId)
  if (!currentDomain) {
    throw new Error("Domain doesn't exist")
  }
  const currentResource = currentDomain.resources.find(resource => resource.resourceId == resourceId)
  if (!currentResource) {
    throw new Error("Resource doesn't exist")
  }
  return currentResource.symbol
}

async function rerunPriceCalculations(): Promise<void> {
  const transfersService = new TransfersService()
  const coinMarketCapServiceInstance = new CoinMarketCapService(coinMarketCapAPIKey, coinMarketCapUrl)
  const transferRepository = new TransferRepository()

  let transfers = []
  const limit = 50
  let page = 1
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL!)
  for (;;) {
    transfers = await transfersService.findTransfers({}, { limit, page })
    if (transfers.length == 0) {
      break
    }
    page++

    for (const transfer of transfers) {
      if (transfer.usdValue == 0) {
        if (!transfer.resourceID) {
          throw new Error("No resource ID on transfer")
        }
        const tokenSymbol = getTokenSymbol(sharedConfig, transfer.fromDomainId, transfer.resourceID)
        let newValue = 0
        if (transfer.amount) {
          newValue = await coinMarketCapServiceInstance.getValueInUSD(transfer.amount!, tokenSymbol)
        }
        logger.info(`Old value: ${transfer.usdValue}\nNew value: ${newValue}\n`)

        await transferRepository.updateTransfer(
          {
            amount: transfer.amount!,
            depositNonce: transfer.depositNonce,
            destination: transfer.destination!,
            fromDomainId: String(transfer.fromDomainId!),
            resourceID: transfer.resourceID!,
            sender: transfer.accountId!,
            toDomainId: String(transfer.toDomainId!),
            usdValue: newValue,
            timestamp: transfer.timestamp!.getTime(),
          },
          transfer.id,
        )
      }
    }
  }
}

rerunPriceCalculations()
  .then(() => {
    logger.info("Reran $ price calculations")
  })
  .catch(err => logger.error("Error while rerunning $ price calculations", err))
