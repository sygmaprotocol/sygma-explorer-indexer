import { expect } from "chai"
import sinon from "sinon"
<<<<<<< HEAD
import { Domain, DomainTypes } from "../../src/indexer/config"
import { parseDestination } from "../../src/indexer/utils/evm"

const ApiPromise = require("@polkadot/api").ApiPromise
const WsProvider = require("@polkadot/api").WsProvider

=======
import { ApiPromise, WsProvider } from "@polkadot/api"
import { Domain, DomainTypes } from "../../src/indexer/config"
import { parseDestination } from "../../src/indexer/utils/evm"

>>>>>>> 3879179031e6eb14b851a56311e3457280d6bd79
describe("Events parser", function () {
  const mockToJson = sinon.stub()
  beforeEach(() => {
    const mockCreateType = sinon.stub()

    const mockApiPromise = {
      createType: mockCreateType,
    }
    mockCreateType.returns({
      toJSON: mockToJson,
    })

<<<<<<< HEAD
    sinon.stub(ApiPromise, "create").resolves(mockApiPromise)
=======
    sinon.stub(ApiPromise, "create").resolves(mockApiPromise as unknown as ApiPromise)
>>>>>>> 3879179031e6eb14b851a56311e3457280d6bd79
  })

  afterEach(() => {
    sinon.restore()
  })

  it("should parse evm destination for evm deposit log", async function () {
    const hexData =
      "0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000145c1f5961696bad2e73f73417f07ef55c62a2dc5b0102"
    const domain = {
      id: 2,
      type: DomainTypes.EVM,
    } as unknown as Domain

    const destination = await parseDestination(hexData, domain)
    expect(destination).to.be.deep.equal("0x1f5961696bad2e73f73417f07ef55c62a2dc5b0102")
  })

  it("should parse substrate destination for evm deposit log", async () => {
    process.env.RPC_URL_CONFIG =
      '[{"id": 1, "endpoint": "http://evm1:8545"}, {"id": 2, "endpoint": "http://evm2:8545"}, {"id": 3, "endpoint": "ws://substrate-pallet:9944"}]'
    const hexData =
      "0x00000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000002400010100d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"
    const domain = {
      id: 3,
      type: DomainTypes.SUBSTRATE,
    } as unknown as Domain

    sinon.stub(WsProvider.prototype, "connect")
    mockToJson.returns({
      parents: 0,
      interior: {
        x1: {
          accountId32: {
            id: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          },
        },
      },
    })
    const destination = await parseDestination(hexData, domain)
    expect(destination).to.equal("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
  })

  it("should return an empty string when junctions.accountId32 is not present", async () => {
    process.env.RPC_URL_CONFIG =
      '[{"id": 1, "endpoint": "http://evm1:8545"}, {"id": 2, "endpoint": "http://evm2:8545"}, {"id": 3, "endpoint": "ws://substrate-pallet:9944"}]'
    const hexData = "0x000000"
    const domain = {
      id: 3,
      type: DomainTypes.SUBSTRATE,
    } as unknown as Domain

    mockToJson.returns({
      parents: 0,
      interior: {
        x1: {},
      },
    })

    sinon.stub(WsProvider.prototype, "connect")
    const result = await parseDestination(hexData, domain)
    expect(result).to.equal("")
  })
})
