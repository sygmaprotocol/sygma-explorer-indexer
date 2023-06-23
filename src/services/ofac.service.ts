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

export class OfacComplianceService {
  private chainAnalisysUrl: string
  private chainAnalisysApiKey: string

  constructor(chainAnalysisUrl: string, chainAnalisysApiKey: string) {
    this.chainAnalisysUrl = chainAnalysisUrl
    this.chainAnalisysApiKey = chainAnalisysApiKey
  }

  public async checkSanctionedAddress(address: string): Promise<string> {
    const response = await fetch(`${this.chainAnalisysUrl}${address}`, {
      headers: {
        "X-API-Key": `${this.chainAnalisysApiKey}`,
        Accept: "application/json",
      },
    })
    const data = (await response.json()) as ChainAnalysisResponse
    return data.identifications.length ? "ofac" : ""
  }
}