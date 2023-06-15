import { decodeDataHash } from "../utils/helpers"

describe("helpers", () => {
  it("decoded datahash", () => {
    const data =
      "0x0000000000000000000000000000000000000000000000003782dace9d900000000000000000000000000000000000000000000000000000000000000000001442da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b"
    expect(decodeDataHash(data)).toMatchObject({
      amount: "4000000000000000000",
      destinationRecipientAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b",
    })
  })
})
