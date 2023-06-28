//@ts-nocheck
import { ApiPromise } from "@polkadot/api"
import DomainRepository from "../../../indexer/repository/domain"
import { Domain, DomainTypes } from "../../../indexer/config"
import { SubstrateIndexer } from "../../../../src/indexer/services/substrateIndexer/substrateIndexer"

jest.mock("@polkadot/api")

describe("SubstrateIndexer", () => {
  let substrateIndexer: SubstrateIndexer
  let apiPromiseMock: jest.Mocked<ApiPromise>
  const domainRepositoryMock = {
    upsertDomain: jest.fn(),
    getLastIndexedBlock: jest.fn(),
  } as unknown as DomainRepository

  const domain = {
    id: 1,
    name: "Domain1",
    type: DomainTypes.SUBSTRATE,
  } as unknown as Domain

  beforeEach(() => {
    ApiPromise.create = jest.fn().mockResolvedValueOnce(apiPromiseMock)

    substrateIndexer = new SubstrateIndexer(domainRepositoryMock, domain)
  })

  describe("indexPastEvents", () => {
    it("Should index evm past events when some blocks already indexed", async () => {
      apiPromiseMock = {
        rpc: {
          chain: {
            getBlock: jest.fn().mockResolvedValue(200),
          },
        },
      } as unknown as jest.Mocked<ApiPromise>

      substrateIndexer.getLastIndexedBlock = jest.fn().mockResolvedValue(100)
      substrateIndexer.saveDataToDb = jest.fn().mockResolvedValue(undefined)

      // Call method
      const res = await substrateIndexer.indexPastEvents()
      // expect that the getBlockNumber method was called once
      expect(apiPromiseMock.rpc.chain.getBlock).toHaveBeenCalledTimes(2)

      // expect that the saveDataToDb method was called once with the correct arguments
      expect(substrateIndexer.saveDataToDb).toHaveBeenCalledWith(1, "200", "Domain1")

      // expect that the result is 11, which is the next block to query
      expect(res).toEqual(201)
    })

    it("Should index evm past events when no blocks are indexed", async () => {
      apiPromiseMock = {
        rpc: {
          chain: {
            getBlock: jest.fn().mockResolvedValue(5000),
          },
        },
      } as unknown as jest.Mocked<ApiPromise>

      substrateIndexer.getLastIndexedBlock = jest.fn().mockResolvedValue(0)
      substrateIndexer.saveDataToDb = jest.fn().mockResolvedValue(undefined)

      // Call method
      const res = await substrateIndexer.indexPastEvents()
      // expect that the getBlockNumber method was called once
      expect(apiPromiseMock.rpc.chain.getBlock).toHaveBeenCalledTimes(4)

      // expect that the saveDataToDb method was called once with the correct arguments
      expect(substrateIndexer.saveDataToDb).toHaveBeenCalledTimes(3)

      // expect that the result is 11, which is the next block to query
      expect(res).toEqual(201)
    })
  })
})
