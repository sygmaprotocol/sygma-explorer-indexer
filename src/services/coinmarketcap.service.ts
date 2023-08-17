import { Transfer } from "@prisma/client"

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

  private async getValueConvertion(amount: string, symbol: string): Promise<CoinMaketCapResponse> {
    const url = `${this.coinMarketCapUrl}/v1/tools/price-conversion?amount=${amount}&symbol=${symbol}&convert=USD`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": this.coinMarketCapAPIKey,
      },
    })
    const { data } = (await response.json()) as { data: CoinMaketCapResponse }
    return data
  }

  public async appendConvertedAmountValueToTransfers(transfers: Transfer[]): Promise<Array<Transfer & { convertedValue: number | null }>> {
    const transfersWithConvertedValue2: Array<Transfer & { convertedValue: number | null }> = []
    for await (const transfer of transfers) {
      const { amount, toDomainId } = transfer
      if (amount !== null) {
        const symbol = this.tokenSymbols.find(token => token.id === toDomainId)?.symbol
        const data = await this.getValueConvertion(amount, symbol!)
        const convertedValue = data.quote.USD.price
        transfersWithConvertedValue2.push({ ...transfer, convertedValue: convertedValue })
      } else {
        transfersWithConvertedValue2.push({ ...transfer, convertedValue: null })
      }
    }

    return transfersWithConvertedValue2
  }
}

export default CoinMarketCapService
