/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/

import path from "path"
import { MemoryCache } from "cache-manager"
import { logger } from "../../../utils/logger"

import { fetchRetry } from "../../../utils/helpers"

export type CoinMaketCapResponse = {
  id: number
  symbol: string
  name: string
  amount: number
  last_updated: string
  quote: {
    USD: {
      price: number
      last_updated: string
    }
  }
}

class CoinMarketCapService {
  private coinMarketCapAPIKey: string
  private coinMarketCapUrl: string
  private memoryCache: MemoryCache

  constructor(coinMakertcapKey: string, coinMarketcapApiURL: string, memoryCache: MemoryCache) {
    this.coinMarketCapAPIKey = coinMakertcapKey
    this.coinMarketCapUrl = coinMarketcapApiURL
    this.memoryCache = memoryCache
  }

  private async getValueConvertion(amount: string, tokenSymbol: string): Promise<CoinMaketCapResponse["quote"]["USD"]["price"]> {
    const tokenValue: number | undefined = await this.memoryCache.get(tokenSymbol)
    if (tokenValue) {
      return Number(amount) * tokenValue
    }

    const url = path.join(this.coinMarketCapUrl, `/v2/tools/price-conversion?amount=1&symbol=${tokenSymbol}&convert=USD`)
    logger.debug(`Calling CoinMarketCap service with URL: ${url}`)
    try {
      const response = await fetchRetry(url, {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": this.coinMarketCapAPIKey,
        },
      })

      const {
        data: [res],
      } = (await response.json()) as { data: CoinMaketCapResponse[] }
      await this.memoryCache.set(tokenSymbol, res.quote.USD.price)
      return Number(amount) * res.quote.USD.price
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err.message)
      }
      throw new Error("Error getting value from CoinMarketCap")
    }
  }

  public async getValueInUSD(amount: string, tokenSymbol: string): Promise<number> {
    const convertedValue = await this.getValueConvertion(amount, tokenSymbol)
    return convertedValue
  }
}

export default CoinMarketCapService
