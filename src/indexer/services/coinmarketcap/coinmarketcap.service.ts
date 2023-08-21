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
  private tokenSymbols: Array<{ id: number; symbol: string }>

  constructor(COINMARKETCAP_API_KEY: string, COINMARKETCAP_API_URL: string, TOKEN_SYMBOLS: Array<{ id: number; symbol: string }>) {
    this.coinMarketCapAPIKey = COINMARKETCAP_API_KEY
    this.coinMarketCapUrl = COINMARKETCAP_API_URL
    this.tokenSymbols = TOKEN_SYMBOLS
  }

  private async getValueConvertion(amount: string, fromDomainId: number | null): Promise<CoinMaketCapResponse["quote"]> {
    const symbol = this.tokenSymbols.find(token => token.id === fromDomainId)?.symbol
    const url = `${this.coinMarketCapUrl}/v1/tools/price-conversion?amount=${amount}&symbol=${symbol!}&convert=USD`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": this.coinMarketCapAPIKey,
      },
    })
    const { data } = (await response.json()) as { data: CoinMaketCapResponse }
    return data.quote
  }

  public async getPriceInUSD(amount: string, fromDomainId: number | null): Promise<number> {
    const data = await this.getValueConvertion(amount, fromDomainId)
    return data.USD.price
  }
}

export default CoinMarketCapService
