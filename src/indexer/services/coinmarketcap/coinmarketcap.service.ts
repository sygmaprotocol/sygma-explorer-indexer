/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/

import { fetchRetry } from "utils/helpers"
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

  constructor(coinMakertcapKey: string, coinMarketcapApiURL: string) {
    this.coinMarketCapAPIKey = coinMakertcapKey
    this.coinMarketCapUrl = coinMarketcapApiURL
  }

  private async getValueConvertion(amount: string, tokenSymbol: string): Promise<CoinMaketCapResponse["quote"]["USD"]["price"]> {
    const url = `${this.coinMarketCapUrl}/v2/tools/price-conversion?amount=${amount}&symbol=${tokenSymbol}&convert=USD`

    try {
      const response = await fetchRetry(url, {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": this.coinMarketCapAPIKey,
        },
      })
      const { data } = (await response.json()) as { data: CoinMaketCapResponse[] }
      return data[0].quote.USD.price
    } catch (err) {
      logger.error(err)
      throw new Error("Error getting value from CoinMarketCap")
    }
  }

  public async getValueInUSD(amount: string, tokenSymbol: string): Promise<number> {
    const convertedValue = await this.getValueConvertion(amount, tokenSymbol)
    return convertedValue
  }
}

export default CoinMarketCapService
