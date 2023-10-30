import { expect } from "chai"
import { fetchRetry } from "../../src/utils/helpers"

describe("Retrying failed requests testing", function () {
  it("Should successfully fetch", async () => {
    const res = await fetchRetry("https://google.com", {}, 1, 100)
    expect(res.status).to.be.deep.equal(200)
  })

  it("Should fail because of invalid request", async () => {
    try {
      await fetchRetry("https://invalid-url", {}, 1, 100)
    } catch (err) {
      expect(err).to.be.not.null
    }
  })
})
