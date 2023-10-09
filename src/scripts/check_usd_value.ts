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

async function checkUsdValue(
  transfersService: TransfersService,
  transferRepository: TransferRepository,
  coinMarketCapServiceInstance: CoinMarketCapService,
): Promise<void> {
  let transfers = []
  const limit = 10
  let page = 1
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL!)
  while (true) {
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
        console.log(`Old value: ${transfer.usdValue}\nNew value: ${newValue}\n`)
        /*transferRepository.updateTransfer({
                    amount: transfer.amount, 
                    depositNonce: transfer.depositNonce, 
                    destination: transfer.destination!, 
                    fromDomainId: String(transfer.fromDomainId!), 
                    resourceID: transfer.resourceID!, 
                    sender: transfer.accountId!, 
                    toDomainId: String(transfer.toDomainId!),
                    usdValue: newValue,
                    timestamp: transfer.timestamp.getTime()
                }, transfer.id)*/
      }
    }
  }
}

try {
  const transfersService = new TransfersService()
  const transferRepository = new TransferRepository()
  const coinMarketCapServiceInstance = new CoinMarketCapService(coinMarketCapAPIKey, coinMarketCapUrl)

  checkUsdValue(transfersService, transferRepository, coinMarketCapServiceInstance)
} catch (err) {
  logger.error(err)
}
