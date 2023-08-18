import url from "url"

type ChainAnalysisIdentIfication = {
  category: string
  name: string
  description: string
  url: string
}

type ChainAnalysisResponse = {
  identifications: Array<ChainAnalysisIdentIfication> | []
}

enum AddressStatus {
  OFAC = "ofac",
}

export class OfacComplianceService {
  private chainAnalisysUrl: string
  private chainAnalisysApiKey: string

  constructor(chainAnalysisUrl: string, chainAnalisysApiKey: string) {
    this.chainAnalisysUrl = chainAnalysisUrl
    this.chainAnalisysApiKey = chainAnalisysApiKey
  }

  public async checkSanctionedAddress(address: string): Promise<string> {
    const urlToUse = url.resolve(this.chainAnalisysUrl, address)
    const response = await fetch(urlToUse, {
      headers: {
        "X-API-Key": `${this.chainAnalisysApiKey}`,
        Accept: "application/json",
      },
    })
    const data = (await response.json()) as ChainAnalysisResponse
    return data.identifications.length ? AddressStatus.OFAC : ""
  }
}
