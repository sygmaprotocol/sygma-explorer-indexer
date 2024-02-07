/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { expect } from "chai"
import axios from "axios"
import { Transfer, Resource, Fee, Deposit, Execution, Domain } from "@prisma/client"
import { DomainTypes } from "../../src/indexer/config"
import { DepositType } from "../../src/indexer/services/evmIndexer/evmTypes"

const NUMBER_OF_TRANSFERS = 35
const NUMBER_OF_SUBSTRATE_DEPOSITS = 3
const NUMBER_OF_FUNGIBLE_DEPOSITS = 32
const NUMBER_OF_PERMISSIONLESS_DEPOSITS = 1
const NUMBER_OF_PERMISSIONED_DEPOSITS = 1
const NUMBER_OF_NFT_DEPOSITS = 1

const DOMAIN_1 = 1
const DOMAIN_3 = 3

const FUNGIBLE_EVM_DEPOSIT_TXHASH = "0x1e33c8969f943ce9e12b56937b97109a3d394b0b0eb9cc77cda0127c89b5961b"
const NONFUNGIBLE_EVM_DEPOSIT_TXHASH = "0x7b7c2be6b60c25a1be9f506fdd75e1aab76d3016f0bc708715405f2e6718c6df"
const PERMISSIONLESS_GENERIC_EVM_DEPOSIT_TXHASH = "0x18fa527a4773789a5ba487dae5bc3d00cc04dc50509b6f67e438efdb60e75c67"
const PERMISSIONED_GENERIC_EVM_DEPOSIT_TXHASH = "0x44b9ac0bbd9052b8468aae63620ee9babff498ace3092babca2994097344b516"
const FUNGIBLE_SUBSTRATE_TO_EVM_DEPOSIT_TXHASH = "356-1"
const FUNGIBLE_EVM_TO_SUBSTRATE_DEPOSIT = "0xdae4f76d4cb634ca175996bb85d76e82f476cc91f71332bdba967f066d9efc16"

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
  let permissionedDeposits = 0
  let nftDeposits = 0

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
        case DepositType.PERMISSIONED_GENERIC: {
          permissionedDeposits++
          break
        }
      }
    }

    expect(transfers.length).to.be.deep.equal(NUMBER_OF_TRANSFERS)
    expect(substrateDeposits).to.be.eq(NUMBER_OF_SUBSTRATE_DEPOSITS)
    expect(fungibleDeposits).to.be.eq(NUMBER_OF_FUNGIBLE_DEPOSITS)
    expect(permissionlessDeposits).to.be.eq(NUMBER_OF_PERMISSIONLESS_DEPOSITS)
    expect(permissionedDeposits).to.be.eq(NUMBER_OF_PERMISSIONED_DEPOSITS)
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

    const transfer = res.data[0] as TransferResponse

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal({
      id: transfer.id,
      message: "",
      depositNonce: 30,
      resourceID: "0x0000000000000000000000000000000000000000000000000000000000000300",
      fromDomainId: 1,
      toDomainId: 2,
      accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
      destination: "0x8e0a907331554af72563bd8d43051c2e64be5d35",
      amount: "0.0000000000000001",
      status: "executed",
      resource: {
        type: "fungible",
        id: "0x0000000000000000000000000000000000000000000000000000000000000300",
      },
      toDomain: { name: "evm2", lastIndexedBlock: transfer.toDomain.lastIndexedBlock, id: 2 },
      fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer.fromDomain.lastIndexedBlock, id: 1 },
      fee: {
        amount: "1000000000000000",
        id: "65c38b127b6fa3b1344975f8",
        resource: {
          decimals: 18,
          id: "0x0000000000000000000000000000000000000000000000000000000000000300",
          type: "fungible",
        },
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000300",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        tokenSymbol: "eth",
        transferId: "65c38b0e7b6fa3b1344975bf",
      },
      deposit: {
        txHash: "0x1e33c8969f943ce9e12b56937b97109a3d394b0b0eb9cc77cda0127c89b5961b",
        blockNumber: "628",
        depositData:
          "0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d350102",
        handlerResponse: "0x",
        timestamp: "2023-07-17T08:32:37.000Z",
      },
      execution: {
        txHash: "0xb8de40d5d0f5eb8ac4d2a54858bcd4946c85dfcb4353710df1cb73cc6b030c10",
        blockNumber: "643",
        timestamp: "2023-07-17T08:33:06.000Z",
      },
      account: {
        addressStatus: "",
      },
      usdValue: 0,
    })
  })

  it("should succesfully fetch evm nonfungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${NONFUNGIBLE_EVM_DEPOSIT_TXHASH}`)
    const transfer = res.data[0] as TransferResponse

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal({
      id: transfer.id,
      depositNonce: 2,
      message: "",
      resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
      fromDomainId: 1,
      toDomainId: 2,
      accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
      destination: "0x8e0a907331554af72563bd8d43051c2e64be5d35",
      amount: "2296080355773541392",
      status: "executed",
      resource: {
        type: "nonfungible",
        id: "0x0000000000000000000000000000000000000000000000000000000000000200",
      },
      toDomain: { name: "evm2", lastIndexedBlock: transfer.toDomain.lastIndexedBlock, id: 2 },
      fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer.fromDomain.lastIndexedBlock, id: 1 },
      fee: {
        amount: "1000000000000000",
        id: "65c38b0e7b6fa3b1344975be",
        resource: {
          decimals: 18,
          id: "0x0000000000000000000000000000000000000000000000000000000000000200",
          type: "nonfungible",
        },
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        tokenSymbol: "eth",
        transferId: "65c38b0c7b6fa3b134497582",
      },
      deposit: {
        txHash: "0x7b7c2be6b60c25a1be9f506fdd75e1aab76d3016f0bc708715405f2e6718c6df",
        blockNumber: "591",
        depositData:
          "0x0000000000000000000000000000000000000000000000001fdd50eb1da26c1000000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c",
        handlerResponse: "0x6d657461646174612e746573746d657461646174612e75726c",
        timestamp: "2023-07-17T08:31:22.000Z",
      },
      execution: {
        txHash: "0x3de2201e548a8332aaa50147a2fb02e2b6669184f042b4dbcf23b4f5d40edcfb",
        blockNumber: "598",
        timestamp: "2023-07-17T08:31:35.000Z",
      },
      account: {
        addressStatus: "",
      },
      usdValue: null,
    })
  })

  it("should succesfully fetch evm permissionless generic transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${PERMISSIONLESS_GENERIC_EVM_DEPOSIT_TXHASH}`)
    const transfer = res.data[0] as TransferResponse

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal({
      id: transfer.id,
      depositNonce: 29,
      resourceID: "0x0000000000000000000000000000000000000000000000000000000000000500",
      fromDomainId: 1,
      message: "",
      toDomainId: 2,
      accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
      destination: "0xb1387b365ae7294ea13bad9db83436e671dd16ba",
      amount: "",
      status: "executed",
      resource: {
        type: "permissionlessGeneric",
        id: "0x0000000000000000000000000000000000000000000000000000000000000500",
      },
      toDomain: { name: "evm2", lastIndexedBlock: transfer.toDomain.lastIndexedBlock, id: 2 },
      fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer.fromDomain.lastIndexedBlock, id: 1 },
      fee: {
        amount: "1000000000000000",
        id: "65c38b117b6fa3b1344975f6",
        resource: {
          decimals: 0,
          id: "0x0000000000000000000000000000000000000000000000000000000000000500",
          type: "permissionlessGeneric",
        },
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000500",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        tokenSymbol: "eth",
        transferId: "65c38b0d7b6fa3b1344975bb",
      },
      deposit: {
        txHash: "0x18fa527a4773789a5ba487dae5bc3d00cc04dc50509b6f67e438efdb60e75c67",
        blockNumber: "623",
        depositData:
          "0x0000000000000000000000000000000000000000000000000000000000030d400004ea287d1514b1387b365ae7294ea13bad9db83436e671dd16ba145c1f5961696bad2e73f73417f07ef55c62a2dc5b47ed248f568cc8f9fe4371a1d1fab88a62af595f8efb9aeff6f0e043b7ea33b10000000000000000000000005c1f5961696bad2e73f73417f07ef55c62a2dc5b",
        handlerResponse: "0x",
        timestamp: "2023-07-17T08:32:27.000Z",
      },
      execution: {
        txHash: "0xcc7c318cfd71745c27111772f21dec553f53277c9dc218fe07b54f897560c0cb",
        blockNumber: "631",
        timestamp: "2023-07-17T08:32:42.000Z",
      },
      account: {
        addressStatus: "",
      },
      usdValue: null,
    })
  })

  it("should succesfully fetch evm permissioned generic transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${PERMISSIONED_GENERIC_EVM_DEPOSIT_TXHASH}?domainID=${DOMAIN_1}`)
    const transfer = res.data[0] as TransferResponse

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal({
      id: transfer.id,
      depositNonce: 3,
      resourceID: "0x0000000000000000000000000000000000000000000000000000000000000100",
      fromDomainId: 1,
      toDomainId: 2,
      accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
      destination: "",
      message: "",
      amount: "",
      status: "executed",
      resource: {
        type: "permissionedGeneric",
        id: "0x0000000000000000000000000000000000000000000000000000000000000100",
      },
      toDomain: { name: "evm2", lastIndexedBlock: transfer.toDomain.lastIndexedBlock, id: 2 },
      fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer.fromDomain.lastIndexedBlock, id: 1 },
      fee: {
        amount: "1000000000000000",
        id: "65c38b0e7b6fa3b1344975c2",
        resource: {
          decimals: 0,
          id: "0x0000000000000000000000000000000000000000000000000000000000000100",
          type: "permissionedGeneric",
        },
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000100",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        tokenSymbol: "eth",
        transferId: "65c38b0c7b6fa3b134497585",
      },
      deposit: {
        txHash: "0x44b9ac0bbd9052b8468aae63620ee9babff498ace3092babca2994097344b516",
        blockNumber: "598",
        depositData:
          "0x000000000000000000000000000000000000000000000000000000000000002030bb0f28498d8bc6272403413a967b2098aa4d7c7422d4ff2ff2c6c2bdc44af3",
        handlerResponse: "0x",
        timestamp: "2023-07-17T08:31:36.000Z",
      },
      execution: {
        txHash: "0xf031174a3a2b3ae7064f2ca083fa35b1b48b7723ae45ce1f925c9c09a3ba3077",
        blockNumber: "603",
        timestamp: "2023-07-17T08:31:45.000Z",
      },
      account: {
        addressStatus: "",
      },
      usdValue: null,
    })
  })

  it("should succesfully fetch substrate to evm fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_SUBSTRATE_TO_EVM_DEPOSIT_TXHASH}?domainID=${DOMAIN_3}`)
    const transfer = res.data[0] as TransferResponse

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal({
      id: transfer.id,
      depositNonce: 2,
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
      toDomain: { name: "Ethereum 1", lastIndexedBlock: transfer.toDomain.lastIndexedBlock, id: 1 },
      fromDomain: { name: "Substrate", lastIndexedBlock: transfer.fromDomain.lastIndexedBlock, id: 3 },
      fee: {
        amount: "50",
        id: "65c38b0a7b6fa3b13449757c",
        resource: {
          decimals: 18,
          id: "0x0000000000000000000000000000000000000000000000000000000000000300",
          type: "fungible",
        },
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000300",
        tokenAddress: "{}",
        tokenSymbol: "PHA",
        transferId: "65c38b0a7b6fa3b13449757a",
      },
      deposit: {
        txHash: "356-1",
        blockNumber: "356",
        depositData:
          "0x00000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000145c1f5961696bad2e73f73417f07ef55c62a2dc5b",
        handlerResponse: "",
        timestamp: "2023-07-17T08:29:12.000Z",
      },
      execution: {
        txHash: "0xe5648eb14c885ddf52226aea17440ec3126bfff778c70e0a366dc9666301ff35",
        blockNumber: "548",
        timestamp: "2023-07-17T08:29:55.000Z",
      },
      account: {
        addressStatus: "",
      },
      usdValue: 0,
    })
  })

  it("should succesfully fetch evm to substrate fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_EVM_TO_SUBSTRATE_DEPOSIT}?domainID=${DOMAIN_1}`)
    const transfer = res.data[0] as TransferResponse

    expect(res.status).to.be.deep.equal(200)
    expect(transfer).to.be.deep.equal({
      id: transfer.id,
      depositNonce: 2,
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
      toDomain: { name: "Substrate", lastIndexedBlock: transfer.toDomain.lastIndexedBlock, id: 3 },
      fromDomain: { name: "Ethereum 1", lastIndexedBlock: transfer.fromDomain.lastIndexedBlock, id: 1 },
      fee: {
        amount: "1000000000000000",
        id: "65c38b0b7b6fa3b13449757f",
        resource: {
          decimals: 18,
          id: "0x0000000000000000000000000000000000000000000000000000000000000300",
          type: "fungible",
        },
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000300",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        tokenSymbol: "eth",
        transferId: "65c38b0a7b6fa3b134497577",
      },
      deposit: {
        txHash: "0xdae4f76d4cb634ca175996bb85d76e82f476cc91f71332bdba967f066d9efc16",
        blockNumber: "516",
        depositData:
          "0x00000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000002400010100d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
        handlerResponse: "0x",
        timestamp: "2023-07-17T08:28:51.000Z",
      },
      execution: {
        txHash: "355-1",
        blockNumber: "355",
        timestamp: "2023-07-17T08:29:06.001Z",
      },
      account: {
        addressStatus: "",
      },
      usdValue: 0,
    })
  })
})
