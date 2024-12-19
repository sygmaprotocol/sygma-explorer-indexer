/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { expect } from "chai"
import axios from "axios"
import { Transfer, Resource, Fee, Deposit, Execution, Domain } from "@prisma/client"
import { DomainTypes } from "../../src/indexer/config"
import { DepositType } from "../../src/indexer/services/evmIndexer/evmTypes"

const NUMBER_OF_TRANSFERS = 31
const NUMBER_OF_SUBSTRATE_DEPOSITS = 1
const NUMBER_OF_FUNGIBLE_DEPOSITS = 29
const NUMBER_OF_PERMISSIONLESS_DEPOSITS = 1
const NUMBER_OF_NFT_DEPOSITS = 1

const DOMAIN_1 = 1
const DOMAIN_3 = 3

const FUNGIBLE_EVM_DEPOSIT_TXHASH = "0x0a4fb75c91ca774d1b2faeed14a0d9c8f261dba64fc8adfe070c0b9f78a07492"

const NONFUNGIBLE_EVM_DEPOSIT_TXHASH = "0x12327002087fe09d30a4bd45e97e55549d92dbf05d254788591dc2b6bca4ef0f"
const FUNGIBLE_SUBSTRATE_TO_EVM_DEPOSIT_TXHASH = "279-1"

const PERMISSIONLESS_GENERIC_EVM_DEPOSIT_TXHASH = "0x2b355542a454d8faedccc75c8741ef0d2f531ea4cd8ed53544734ff681377699"

const FUNGIBLE_EVM_TO_SUBSTRATE_DEPOSIT_TXHASH = "0x967b320daebffcba435b6bf9ba493963471f6ca9d12c84c9f156bda6862934e0"
type TransferResponse = Transfer & {
  resource: Resource
  toDomain: Domain
  fromDomain: Domain
  fee: Fee
  deposit: Deposit
  execution: Execution
}
describe("Indexer e2e tests", function () {
  let substrateDeposits = 0
  let fungibleDeposits = 0
  let permissionlessDeposits = 0
  let nftDeposits = 0

  before(async () => {
    let transfers = 0
    let isProcessing = false
    while (transfers !== NUMBER_OF_TRANSFERS || isProcessing) {
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

  it("Should succesfully fetch all transfers", async () => {
    const res = await axios.get("http://localhost:8000/api/transfers?page=1&limit=100")
    const transfers = res.data as Array<TransferResponse>

    for (const transfer of transfers) {
      if (transfer.fromDomain.name.toLowerCase() == DomainTypes.SUBSTRATE) {
        substrateDeposits++
      }
      switch (transfer.resource.type) {
        case DepositType.FUNGIBLE: {
          fungibleDeposits++
          break
        }
        case DepositType.NONFUNGIBLE: {
          nftDeposits++
          break
        }
        case DepositType.PERMISSIONLESS_GENERIC: {
          permissionlessDeposits++
          break
        }
      }
    }

    expect(transfers.length).to.be.deep.equal(NUMBER_OF_TRANSFERS)
    expect(substrateDeposits).to.be.eq(NUMBER_OF_SUBSTRATE_DEPOSITS)
    expect(fungibleDeposits).to.be.eq(NUMBER_OF_FUNGIBLE_DEPOSITS)
    expect(permissionlessDeposits).to.be.eq(NUMBER_OF_PERMISSIONLESS_DEPOSITS)
    expect(nftDeposits).to.be.eq(NUMBER_OF_NFT_DEPOSITS)

    transfers.map(transfer => {
      expect(transfer.id).to.be.not.null
      expect(transfer.depositNonce).to.be.not.null
      expect(transfer.fromDomain).to.be.not.null
      expect(transfer.fromDomainId).to.be.not.null
      expect(transfer.status).to.be.not.null
      expect(transfer.amount).to.be.not.null
      expect(transfer.destination).to.be.not.null
      expect(transfer.resource).to.be.not.null
      expect(transfer.resourceID).to.be.not.null
      expect(transfer.accountId).to.be.not.null
      expect(transfer.toDomain).to.be.not.null
      expect(transfer.toDomainId).to.be.not.null
      expect(transfer.execution).to.be.not.null
      expect(transfer.deposit.timestamp).to.be.not.null
      expect(transfer.execution.timestamp).to.be.not.null
    })
  })
  it("should succesfully fetch evm fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_EVM_DEPOSIT_TXHASH}?domainID=${DOMAIN_1}`)

    const transfer = res.data as TransferResponse[]

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal([
      {
        id: transfer[0].id,
        message: "",
        depositNonce: 1,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromDomainId: 1,
        toDomainId: 2,
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        destination: "0x5c1f5961696bad2e73f73417f07ef55c62a2dc5b",
        amount: "0.0000000000000001",
        status: "executed",
        resource: {
          type: "fungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
        toDomain: { name: "evm2", lastIndexedBlock: transfer[0].toDomain.lastIndexedBlock, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer[0].fromDomain.lastIndexedBlock, id: 1 },
        fee: {
          amount: "100000000000000",
          id: transfer[0].fee.id,
          decimals: 18,
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfer[0].id,
        },
        deposit: {
          txHash: "0x0a4fb75c91ca774d1b2faeed14a0d9c8f261dba64fc8adfe070c0b9f78a07492",
          blockNumber: "115",
          depositData:
            "0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000145c1f5961696bad2e73f73417f07ef55c62a2dc5b",
          handlerResponse: "0x0000000000000000000000000000000000000000000000000000000000000064",
          timestamp: "2024-11-14T08:16:41.000Z",
        },
        execution: {
          txHash: "0x8be14ce560b614606e2fad63c6bd58f80a7bc2ae344114eed094ec5296178888",
          blockNumber: "123",
          timestamp: "2024-11-14T08:17:00.000Z",
        },
        account: {
          addressStatus: "",
        },
        usdValue: 0,
      },
    ])
  })

  it("should succesfully fetch evm nonfungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${NONFUNGIBLE_EVM_DEPOSIT_TXHASH}`)
    const transfer = res.data as TransferResponse[]

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal([
      {
        id: transfer[0].id,
        depositNonce: 2,
        message: "",
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
        fromDomainId: 1,
        toDomainId: 2,
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        destination: "0x8e0a907331554af72563bd8d43051c2e64be5d35",
        amount: "2935717020161974584",
        status: "executed",
        resource: {
          type: "nonfungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000200",
        },
        toDomain: { name: "evm2", lastIndexedBlock: transfer[0].toDomain.lastIndexedBlock, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer[0].fromDomain.lastIndexedBlock, id: 1 },
        fee: {
          amount: "100000000000000",
          id: transfer[0].fee.id,
          decimals: 18,
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfer[0].id,
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
        account: {
          addressStatus: "",
        },
        usdValue: null,
      },
    ])
  })

  it("should succesfully fetch evm permissionless generic transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${PERMISSIONLESS_GENERIC_EVM_DEPOSIT_TXHASH}`)
    const transfer = res.data as TransferResponse[]

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal([
      {
        id: transfer[0].id,
        depositNonce: 28,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000500",
        fromDomainId: 1,
        message: "",
        toDomainId: 2,
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        destination: "0xa2451c8553371e754f5e93a440adcca1c0dcf395",
        amount: "",
        status: "executed",
        resource: {
          type: "permissionlessGeneric",
          id: "0x0000000000000000000000000000000000000000000000000000000000000500",
        },
        toDomain: { name: "evm2", lastIndexedBlock: transfer[0].toDomain.lastIndexedBlock, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer[0].fromDomain.lastIndexedBlock, id: 1 },
        fee: {
          amount: "100000000000000",
          id: transfer[0].fee.id,
          decimals: 18,
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfer[0].id,
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
        account: {
          addressStatus: "",
        },
        usdValue: null,
      },
    ])
  })

  it("should succesfully fetch substrate to evm fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_SUBSTRATE_TO_EVM_DEPOSIT_TXHASH}?domainID=${DOMAIN_3}`)
    const transfer = res.data as TransferResponse[]

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal([
      {
        id: transfer[0].id,
        depositNonce: 0,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000300",
        fromDomainId: 3,
        message: "",
        toDomainId: 1,
        accountId: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        destination: "0x5c1f5961696bad2e73f73417f07ef55c62a2dc5b",
        amount: "0.000000000001",
        status: "executed",
        resource: {
          type: "fungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000300",
        },
        toDomain: { name: "Ethereum 1", lastIndexedBlock: transfer[0].toDomain.lastIndexedBlock, id: 1 },
        fromDomain: { name: "Substrate", lastIndexedBlock: transfer[0].fromDomain.lastIndexedBlock, id: 3 },
        fee: {
          id: transfer[0].fee.id,
          amount: "0",
          decimals: 6,
          tokenAddress:
            '{"Concrete":{"parents":"1","interior":{"X3":[{"Parachain":"2,005"},{"GeneralKey":{"length":"5","data":"0x7379676d61000000000000000000000000000000000000000000000000000000"}},{"GeneralKey":{"length":"4","data":"0x7573646300000000000000000000000000000000000000000000000000000000"}}]}}}',
          tokenSymbol: "USDC",
          transferId: transfer[0].id,
        },
        deposit: {
          txHash: "279-1",
          blockNumber: "279",
          depositData:
            "0x00000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000145c1f5961696bad2e73f73417f07ef55c62a2dc5b",
          handlerResponse: "",
          timestamp: "2024-11-14T08:19:48.001Z",
        },
        execution: {
          txHash: "0x9b10747083d576b05caa28edbecd5937080b77ae27da3485b29376e168e4076d",
          blockNumber: "218",
          timestamp: "2024-11-14T08:20:10.000Z",
        },
        account: {
          addressStatus: "",
        },
        usdValue: 0,
      },
    ])
  })

  it("should succesfully fetch evm to substrate fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_EVM_TO_SUBSTRATE_DEPOSIT_TXHASH}?domainID=${DOMAIN_1}`)
    const transfer = res.data as TransferResponse[]

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal([
      {
        id: transfer[0].id,
        depositNonce: 1,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000300",
        fromDomainId: 1,
        message: "",
        toDomainId: 3,
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        destination: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        amount: "0.0001",
        status: "executed",
        resource: {
          type: "fungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000300",
        },
        toDomain: { name: "Substrate", lastIndexedBlock: transfer[0].toDomain.lastIndexedBlock, id: 3 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer[0].fromDomain.lastIndexedBlock, id: 1 },
        fee: {
          amount: "100000000000000",
          id: transfer[0].fee.id,
          decimals: 18,
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          transferId: transfer[0].id,
        },
        deposit: {
          txHash: "0x967b320daebffcba435b6bf9ba493963471f6ca9d12c84c9f156bda6862934e0",
          blockNumber: "195",
          depositData:
            "0x00000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000002400010100d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
          handlerResponse: "0x00000000000000000000000000000000000000000000000000005af3107a4000",
          timestamp: "2024-11-14T08:19:23.000Z",
        },
        execution: {
          txHash: "278-1",
          blockNumber: "278",
          timestamp: "2024-11-14T08:19:42.000Z",
        },
        account: {
          addressStatus: "",
        },
        usdValue: 0,
      },
    ])
  })
})
