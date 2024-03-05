/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { expect } from "chai"
import axios from "axios"
import { Transfer, Resource, Fee, Deposit, Execution, Domain } from "@prisma/client"

type TransferResponse = Transfer & {
  resource: Resource
  toDomain: Domain
  fromDomain: Domain
  fee: Fee
  deposit: Deposit
  execution: Execution
}

const NUMBER_OF_ERC20TST_TRANSFERS = 26
const NUMBER_OF_ERC20LRTEST_TRANSFERS = 6
const NUMBER_OF_ERC721TST_TRANSFERS = 1
const NUMBER_OF_PERMISSIONLESS_TRANSFERS = 1
const NUMBER_OF_PERMISSIONED_TRANSFERS = 1

const ERC20TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000000"
const ERC20LRTEST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000300"
const ERC721TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000200"
const PERMISSIONLESS_GENERIC_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000500"
const PERMISSIONED_GENERIC_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000100"

describe("Get all transfers for a specific resource", function () {
  before(async () => {
    let transfers = 0
    let isProcessing = false
    while (transfers !== 35 || isProcessing) {
      const res: { data: Array<TransferResponse> } = await axios.get("http://localhost:8000/api/transfers?page=1&limit=100")

      transfers = res.data.length

      isProcessing = false
      for (const transfer of res.data) {
        if (!transfer.deposit || !transfer.execution) {
          isProcessing = true
        }
      }
    }
  })

  it("Should successfully fetch all ERC20TST transfers", async () => {
    const res = await axios.get(`http://localhost:8000/api/resources/${ERC20TST_RESOURCE_ID}/transfers?page=1&limit=50`)
    const transfers = res.data as Array<TransferResponse>

    expect(res.status).to.be.deep.equal(200)
    expect(transfers.length).to.be.deep.equal(NUMBER_OF_ERC20TST_TRANSFERS)

    for (const transfer of transfers) {
      expect(transfer.resourceID).to.be.deep.equal(ERC20TST_RESOURCE_ID)
    }
  })

  it("Should successfully fetch all ERC20LRTest transfers", async () => {
    const res = await axios.get(`http://localhost:8000/api/resources/${ERC20LRTEST_RESOURCE_ID}/transfers?page=1&limit=100`)
    const transfers = res.data as Array<TransferResponse>

    expect(res.status).to.be.deep.equal(200)
    expect(transfers.length).to.be.deep.equal(NUMBER_OF_ERC20LRTEST_TRANSFERS)

    for (const transfer of transfers) {
      expect(transfer.resourceID).to.be.deep.equal(ERC20LRTEST_RESOURCE_ID)
    }
  })

  it("Should successfully fetch all ERC721TST transfers", async () => {
    const res = await axios.get(`http://localhost:8000/api/resources/${ERC721TST_RESOURCE_ID}/transfers?page=1&limit=100`)
    const transfers = res.data as Array<TransferResponse>

    expect(res.status).to.be.deep.equal(200)
    expect(transfers.length).to.be.deep.equal(NUMBER_OF_ERC721TST_TRANSFERS)

    expect(transfers).to.be.deep.equal([
      {
        id: transfers[0].id,
        depositNonce: 2,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
        fromDomainId: 1,
        toDomainId: 2,
        destination: "0x8e0a907331554af72563bd8d43051c2e64be5d35",
        amount: "2296080355773541392",
        status: "executed",
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        message: "",
        usdValue: null,
        resource: {
          type: "nonfungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000200",
        },
        toDomain: { name: "evm2", lastIndexedBlock: transfers[0].toDomain.lastIndexedBlock, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfers[0].fromDomain.lastIndexedBlock, id: 1 },
        securityModel: null,
        fee: {
          amount: "1000000000000000",
          id: transfers[0].fee.id,
          resource: {
            decimals: 18,
            id: "0x0000000000000000000000000000000000000000000000000000000000000200",
            type: "nonfungible",
          },
          resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfers[0].id,
        },
        deposit: {
          txHash: "0x7b7c2be6b60c25a1be9f506fdd75e1aab76d3016f0bc708715405f2e6718c6df",
          blockNumber: "591",
          depositData:
            "0x0000000000000000000000000000000000000000000000001fdd50eb1da26c1000000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c",
          timestamp: "2023-07-17T08:31:22.000Z",
        },
        execution: {
          txHash: "0x3de2201e548a8332aaa50147a2fb02e2b6669184f042b4dbcf23b4f5d40edcfb",
          blockNumber: "598",
          timestamp: "2023-07-17T08:31:35.000Z",
        },
        account: { addressStatus: "" },
      },
    ])
  })

  it("Should successfully fetch all permissionless generic transfers", async () => {
    const res = await axios.get(`http://localhost:8000/api/resources/${PERMISSIONLESS_GENERIC_RESOURCE_ID}/transfers?page=1&limit=100`)
    const transfers = res.data as Array<TransferResponse>

    expect(res.status).to.be.deep.equal(200)
    expect(transfers.length).to.be.deep.equal(NUMBER_OF_PERMISSIONLESS_TRANSFERS)

    expect(transfers).to.be.deep.equal([
      {
        id: transfers[0].id,
        depositNonce: 29,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000500",
        fromDomainId: 1,
        toDomainId: 2,
        destination: "0xb1387b365ae7294ea13bad9db83436e671dd16ba",
        amount: "",
        status: "executed",
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        message: "",
        usdValue: null,
        resource: {
          type: "permissionlessGeneric",
          id: "0x0000000000000000000000000000000000000000000000000000000000000500",
        },
        toDomain: { name: "evm2", lastIndexedBlock: transfers[0].toDomain.lastIndexedBlock, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfers[0].fromDomain.lastIndexedBlock, id: 1 },
        securityModel: null,
        fee: {
          amount: "1000000000000000",
          id: transfers[0].fee.id,
          resource: {
            decimals: 0,
            id: "0x0000000000000000000000000000000000000000000000000000000000000500",
            type: "permissionlessGeneric",
          },
          resourceID: "0x0000000000000000000000000000000000000000000000000000000000000500",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfers[0].id,
        },
        deposit: {
          txHash: "0x18fa527a4773789a5ba487dae5bc3d00cc04dc50509b6f67e438efdb60e75c67",
          blockNumber: "623",
          depositData:
            "0x0000000000000000000000000000000000000000000000000000000000030d400004ea287d1514b1387b365ae7294ea13bad9db83436e671dd16ba145c1f5961696bad2e73f73417f07ef55c62a2dc5b47ed248f568cc8f9fe4371a1d1fab88a62af595f8efb9aeff6f0e043b7ea33b10000000000000000000000005c1f5961696bad2e73f73417f07ef55c62a2dc5b",
          timestamp: "2023-07-17T08:32:27.000Z",
        },
        execution: {
          txHash: "0xcc7c318cfd71745c27111772f21dec553f53277c9dc218fe07b54f897560c0cb",
          blockNumber: "631",
          timestamp: "2023-07-17T08:32:42.000Z",
        },
        account: { addressStatus: "" },
      },
    ])
  })

  it("Should successfully fetch all permissioned generic transfers", async () => {
    const res = await axios.get(`http://localhost:8000/api/resources/${PERMISSIONED_GENERIC_RESOURCE_ID}/transfers?page=1&limit=100`)
    const transfers = res.data as Array<TransferResponse>

    expect(res.status).to.be.deep.equal(200)
    expect(transfers.length).to.be.deep.equal(NUMBER_OF_PERMISSIONED_TRANSFERS)

    expect(transfers).to.be.deep.equal([
      {
        id: transfers[0].id,
        depositNonce: 3,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000100",
        fromDomainId: 1,
        toDomainId: 2,
        destination: "",
        amount: "",
        status: "executed",
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        message: "",
        usdValue: null,
        resource: {
          type: "permissionedGeneric",
          id: "0x0000000000000000000000000000000000000000000000000000000000000100",
        },
        toDomain: { name: "evm2", lastIndexedBlock: transfers[0].toDomain.lastIndexedBlock, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfers[0].fromDomain.lastIndexedBlock, id: 1 },
        securityModel: null,
        fee: {
          amount: "1000000000000000",
          id: transfers[0].fee.id,
          resource: {
            decimals: 0,
            id: "0x0000000000000000000000000000000000000000000000000000000000000100",
            type: "permissionedGeneric",
          },
          resourceID: "0x0000000000000000000000000000000000000000000000000000000000000100",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfers[0].id,
        },
        deposit: {
          txHash: "0x44b9ac0bbd9052b8468aae63620ee9babff498ace3092babca2994097344b516",
          blockNumber: "598",
          depositData:
            "0x000000000000000000000000000000000000000000000000000000000000002030bb0f28498d8bc6272403413a967b2098aa4d7c7422d4ff2ff2c6c2bdc44af3",
          timestamp: "2023-07-17T08:31:36.000Z",
        },
        execution: {
          txHash: "0xf031174a3a2b3ae7064f2ca083fa35b1b48b7723ae45ce1f925c9c09a3ba3077",
          blockNumber: "603",
          timestamp: "2023-07-17T08:31:45.000Z",
        },
        account: { addressStatus: "" },
      },
    ])
  })
})
