import { logger } from "../../../utils/logger"
import CoinMarketCapService from "./coinmarketcap.service"


async function testCoinMarketCap() {
const coinMarketCapAPIKey = process.env.COINMARKETCAP_API_KEY || ""
  const coinMarketCapUrl = process.env.COINMARKETCAP_API_URL || ""

  const coinMarketCapServiceInstance = new CoinMarketCapService(coinMarketCapAPIKey, coinMarketCapUrl)

  let amountInUSD = 0
  try {
    amountInUSD = await coinMarketCapServiceInstance.getValueInUSD("1", "")
    console.log(amountInUSD)
  } catch (error) {
    logger.error((error as Error).message)
    amountInUSD = 0
    console.log(amountInUSD)
  }

}

testCoinMarketCap()