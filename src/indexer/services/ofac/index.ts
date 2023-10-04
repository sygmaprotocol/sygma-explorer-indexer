/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
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

  public async checkSanctionedAddress(address: string): Promise<string | Error> {
    const urlToUse = url.resolve(this.chainAnalisysUrl, address)

    const response = await fetch(urlToUse, {
      headers: {
        "X-API-Key": `${this.chainAnalisysApiKey}`,
        Accept: "application/json",
      },
    })
    const data = (await response.json()) as ChainAnalysisResponse

    if (response.status !== 200) {
      throw new Error(`Chain Analysis API returned status ${response.status}`)
    }

    return data.identifications.length ? AddressStatus.OFAC : ""
  }
}
