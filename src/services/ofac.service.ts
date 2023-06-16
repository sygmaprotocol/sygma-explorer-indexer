import dotenv from "dotenv"

dotenv.config()

const CHAIN_ANALYSIS_API_KEY = process.env.CHAIN_ANALYSIS_API_KEY
const CHAIN_ANALYSIS_URL = process.env.CHAIN_ANALYSIS_URL

type ChainAnalysisResponse = {
  identifications:
    | [
        {
          category: string
          name: string
          description: string
          url: string
        },
      ]
    | []
}

export const checkSanctionedAddress = async (address: string): Promise<string> => {
  const url = `${CHAIN_ANALYSIS_URL!}${address}`
  const response = await fetch(url, {
    headers: {
      "X-API-Key": `${CHAIN_ANALYSIS_API_KEY!}`,
      Accept: "application/json",
    },
  })
  const data = (await response.json()) as ChainAnalysisResponse
  return data.identifications.length ? "ofac" : ""
}
