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

  private async getValueConvertion(amount: string, tokenSymbol: string): Promise<CoinMaketCapResponse["quote"]> {
    const url = `${this.coinMarketCapUrl}/v1/tools/price-conversion?amount=${amount}&symbol=${tokenSymbol}&convert=USD`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": this.coinMarketCapAPIKey,
      },
    })
    const { data } = (await response.json()) as { data: CoinMaketCapResponse }
    return data.quote
  }

  public async getValueInUSD(amount: string, tokenSymbol: string): Promise<number> {
    const data = await this.getValueConvertion(amount, tokenSymbol)
    return data.USD.price
  }
}

export default CoinMarketCapService
