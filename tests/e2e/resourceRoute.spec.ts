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
const NUMBER_OF_ERC20LRTEST_TRANSFERS = 3
const NUMBER_OF_ERC721TST_TRANSFERS = 1
const NUMBER_OF_PERMISSIONLESS_TRANSFERS = 1

const ERC20TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000000"
const ERC20LRTEST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000300"
const ERC721TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000200"
const PERMISSIONLESS_GENERIC_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000500"

describe("Get all transfers for a specific resource", function () {
  before(async () => {
    let transfers = 0
    let isProcessing = false
    while (transfers !== 31 || isProcessing) {
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
        amount: "2935717020161974584",
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
        fee: {
          amount: "100000000000000",
          id: transfers[0].fee.id,
          decimals: 18,
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfers[0].id,
        },
        deposit: {
          txHash: "0x12327002087fe09d30a4bd45e97e55549d92dbf05d254788591dc2b6bca4ef0f",
          blockNumber: "130",
          depositData:
            "0x00000000000000000000000000000000000000000000000028bdc31363d2a13800000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c",
          handlerResponse: "0x6d657461646174612e746573746d657461646174612e75726c",
          timestamp: "2024-11-14T08:17:11.000Z",
        },
        execution: {
          txHash: "0x43c02a7cee493621c550e059489db14500b5a388185d61deeb7d9a7f52959e8d",
          blockNumber: "138",
          timestamp: "2024-11-14T08:17:31.000Z",
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
        depositNonce: 28,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000500",
        fromDomainId: 1,
        toDomainId: 2,
        destination: "0xa2451c8553371e754f5e93a440adcca1c0dcf395",
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
        fee: {
          amount: "100000000000000",
          id: transfers[0].fee.id,
          decimals: 18,
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfers[0].id,
        },
        deposit: {
          txHash: "0x2b355542a454d8faedccc75c8741ef0d2f531ea4cd8ed53544734ff681377699",
          blockNumber: "155",
          depositData:
            "0x00000000000000000000000000000000000000000000000000000000000927c00004ea287d1514a2451c8553371e754f5e93a440adcca1c0dcf395145c1f5961696bad2e73f73417f07ef55c62a2dc5b35353436383833363939383137363233353732000000000000000000000000000000000000000000000000005c1f5961696bad2e73f73417f07ef55c62a2dc5b",
          handlerResponse: "0x",
          timestamp: "2024-11-14T08:18:03.000Z",
        },
        execution: {
          txHash: "0x508195d23128b60c20a577eca7ace567e6ec68f636bad42ddb554b7d96644dd3",
          blockNumber: "162",
          timestamp: "2024-11-14T08:18:20.000Z",
        },
        account: { addressStatus: "" },
      },
    ])
  })
})
