/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { expect } from "chai"
import { fetchRetry } from "../../src/utils/helpers"

describe("Failed requests retry testing", function () {
  it("Should successfully fetch", async () => {
    const res = await fetchRetry("https://google.com", {}, 1, 100)
    expect(res.status).to.be.deep.equal(200)
  })

  it("Should fail because of invalid request", async () => {
    try {
      await fetchRetry("https://invalid-url", {}, 1, 100)
    } catch (err) {
      expect(err).to.be.not.null
      if (err instanceof Error) {
        expect(err.message).to.be.equal("Error while fetching URL: https://invalid-url. Status code: 0")
      }
    }
  })
})
