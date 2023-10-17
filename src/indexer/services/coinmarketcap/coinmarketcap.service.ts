/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { MemoryCache, caching } from "cache-manager"


import { fetchRetry } from "../../../utils/helpers"
import { logger } from "../../../utils/logger"

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
  private memoryCache!: MemoryCache

  constructor(coinMakertcapKey: string, coinMarketcapApiURL: string) {
    this.coinMarketCapAPIKey = coinMakertcapKey
    this.coinMarketCapUrl = coinMarketcapApiURL
    caching("memory", {
      ttl: 15 * 1000,
    })
      .then(memoryCache => (this.memoryCache = memoryCache))
      .catch(() => {
        throw new Error("Error while initializing memory cache.")
      })
  }

  private async getValueConvertion(amount: string, tokenSymbol: string): Promise<CoinMaketCapResponse["quote"]["USD"]["price"]> {
    const tokenValue = await this.memoryCache.get(tokenSymbol)
    if (tokenValue) {
      return Number(tokenValue) * Number(amount)
    }

    const url = `${this.coinMarketCapUrl}/v2/tools/price-conversion?amount=${amount}&symbol=${tokenSymbol}&convert=USD`
    logger.debug(`Calling CoinMarketCap service with URL: ${url}`)
    try {
      const response = await fetchRetry(url, {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": this.coinMarketCapAPIKey,
        },
      })

      const { data } = (await response.json()) as { data: CoinMaketCapResponse[] }

      await this.memoryCache.set(tokenSymbol, data[0].quote.USD.price / Number(amount))

      return data[0].quote.USD.price
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
