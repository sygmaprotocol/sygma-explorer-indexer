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
  private coinMarketCapAPIKey: string | undefined
  private coinMarketCapUrl: string | undefined

  constructor(coinMakertcapKey?: string, coinMarketcapApiURL?: string) {
    this.coinMarketCapAPIKey = coinMakertcapKey
    this.coinMarketCapUrl = coinMarketcapApiURL
  }

  private async getValueConvertion(amount: string, tokenSymbol: string): Promise<CoinMaketCapResponse["quote"]["USD"]["price"]> {
    if (!this.coinMarketCapAPIKey || !this.coinMarketCapUrl) throw new Error("CoinMarketCap credentials not found")

    const url = `${this.coinMarketCapUrl}/v1/tools/price-conversion?amount=${amount}&symbol=${tokenSymbol}&convert=USD`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": this.coinMarketCapAPIKey,
        },
      })
      const { data } = (await response.json()) as { data: CoinMaketCapResponse }
      return data.quote.USD.price
    } catch {
      throw new Error("Error getting value from CoinMarketCap")
    }
  }

  public async getValueInUSD(amount: string, tokenSymbol: string): Promise<number> {
    const convertedValue = await this.getValueConvertion(amount, tokenSymbol)
    return convertedValue
  }
}

export default CoinMarketCapService
