/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { MemoryCache } from "cache-manager"
import { Transfer } from "@prisma/client"
import CoinMarketCapService from "../../indexer/services/coinmarketcap/coinmarketcap.service"
import TransferRepository from "../../indexer/repository/transfer"
import { SharedConfig } from "../../indexer/config"
import { logger } from "../../utils/logger"
import { IFixInterface } from "../interfaces"

export class PriceCalculation implements IFixInterface {
  private memoryCache: MemoryCache
  private sharedConfig: SharedConfig
  private coinMarketCapServiceInstance: CoinMarketCapService
  private transferRepository: TransferRepository

  constructor(memoryCache: MemoryCache, sharedConfig: SharedConfig) {
    const coinMarketCapAPIKey = process.env.COINMARKETCAP_API_KEY || ""
    const coinMarketCapUrl = process.env.COINMARKETCAP_API_URL || ""
    this.memoryCache = memoryCache
    this.coinMarketCapServiceInstance = new CoinMarketCapService(coinMarketCapAPIKey, coinMarketCapUrl, this.memoryCache)
    this.transferRepository = new TransferRepository()
    this.sharedConfig = sharedConfig
  }

  private getTokenSymbol(sharedConfig: SharedConfig, fromDomainId: number, resourceId: string): string {
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

  public async executeAction(transfer: Transfer): Promise<void> {
    if (transfer.usdValue == 0 || transfer.usdValue == null) {
      if (!transfer.resourceID) {
        throw new Error("No resource ID on transfer")
      }
      const tokenSymbol = this.getTokenSymbol(this.sharedConfig, transfer.fromDomainId, transfer.resourceID!)
      let newValue = 0
      if (transfer.amount) {
        newValue = await this.coinMarketCapServiceInstance.getValueInUSD(transfer.amount!, tokenSymbol)
      }
      logger.info(`Old value: ${transfer.usdValue!} => New value: ${newValue}`)
      await this.transferRepository.updateTransfer(
        {
          amount: transfer.amount!,
          depositNonce: transfer.depositNonce,
          destination: transfer.destination!,
          fromDomainId: String(transfer.fromDomainId!),
          resourceID: transfer.resourceID!,
          sender: transfer.accountId!,
          toDomainId: String(transfer.toDomainId!),
          usdValue: newValue,
        },
        transfer.id,
      )
    }
  }
}
