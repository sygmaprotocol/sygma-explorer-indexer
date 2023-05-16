import { providers } from "ethers"
import { BaseProvider } from "@ethersproject/providers"
import DomainRepository from "indexer/repository/domain"
import { Domain, DomainTypes, LocalDomainConfig } from "indexer/config"
import { EvmIndexer } from "../../../../src/indexer/services/evmIndexer/evmIndexer"

jest.mock("@polkadot/api")

describe("EvmIndexer", () => {
  let evmIndexer: EvmIndexer
  let providerMock: BaseProvider
  const domainRepositoryMock = {
    upsertDomain: jest.fn(),
    getLastIndexedBlock: jest.fn(),
  } as unknown as DomainRepository

  const domain = {
    id: 1,
    name: "Domain1",
    type: DomainTypes.EVM,
    url: "test",
  } as unknown as Domain
  const domainConfig = {
    url: "testUrl",
    startBlock: 50,
  } as unknown as LocalDomainConfig

  it("Should index evm past events when some blocks already indexed", async () => {
    // create a mock Provider object
    providerMock = {
      getBlockNumber: jest.fn().mockResolvedValue(200),
    } as unknown as BaseProvider

    jest.spyOn(providers, "getDefaultProvider").mockReturnValue(providerMock)
    evmIndexer = new EvmIndexer(domainConfig, domainRepositoryMock, domain)

    evmIndexer.getLastIndexedBlock = jest.fn().mockResolvedValue(100)
    evmIndexer.saveDataToDb = jest.fn().mockResolvedValue(undefined)
    // call the indexPastEvents method
    const result = await evmIndexer.indexPastEvents()

    // expect that the getBlockNumber method was called once
    expect(providerMock.getBlockNumber).toHaveBeenCalledTimes(2)

    // expect that the saveDataToDb method was called once with the correct arguments
    expect(evmIndexer.saveDataToDb).toHaveBeenCalledWith(1, "200", "Domain1")

    // expect that the result is 11, which is the next block to query
    expect(result).toEqual(201)
  })

  it("Should index evm past events when no blocks are indexed", async () => {
    // create a mock Provider object
    providerMock = {
      getBlockNumber: jest.fn().mockResolvedValue(5000),
    } as unknown as BaseProvider
    jest.spyOn(providers, "getDefaultProvider").mockReturnValue(providerMock)
    evmIndexer = new EvmIndexer(domainConfig, domainRepositoryMock, domain)

    evmIndexer.getLastIndexedBlock = jest.fn().mockResolvedValue(0)
    evmIndexer.saveDataToDb = jest.fn().mockResolvedValue(undefined)
    // call the indexPastEvents method
    const result = await evmIndexer.indexPastEvents()

    // expect that the getBlockNumber method was called once
    expect(providerMock.getBlockNumber).toHaveBeenCalledTimes(4)

    // expect that the saveDataToDb method was called once with the correct arguments
    expect(evmIndexer.saveDataToDb).toHaveBeenCalledTimes(3)

    // expect that the result is 11, which is the next block to query
    expect(result).toEqual(5001)
  })
})
