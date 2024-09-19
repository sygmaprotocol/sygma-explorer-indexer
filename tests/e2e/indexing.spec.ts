/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { expect } from "chai"
import axios from "axios"
import { Transfer, Resource, Fee, Deposit, Execution, Domain } from "@prisma/client"
import { DomainTypes } from "../../src/indexer/config"
import { DepositType } from "../../src/indexer/services/evmIndexer/evmTypes"

const NUMBER_OF_TRANSFERS = 34
const NUMBER_OF_SUBSTRATE_DEPOSITS = 2
const NUMBER_OF_FUNGIBLE_DEPOSITS = 32
const NUMBER_OF_PERMISSIONLESS_DEPOSITS = 1
const NUMBER_OF_NFT_DEPOSITS = 1
const NUMBER_OF_BITCOIN_DEPOSITS = 1

const DOMAIN_1 = 1
const DOMAIN_3 = 3
const DOMAIN_4 = 4

const FUNGIBLE_EVM_DEPOSIT_TXHASH = "0x985be57588ed9d726fca40d1ee0703f13670d0f66c94951393b9758687c8b3eb"
const NONFUNGIBLE_EVM_DEPOSIT_TXHASH = "0x973bd4a61c3999fb05fb72372dea3966996f06f6ea20db868fa80e10404d9a58"
const PERMISSIONLESS_GENERIC_EVM_DEPOSIT_TXHASH = "0x18c3016efba659900ff22312b1ed2584e289860237e2207049314a7334615ec8"
const FUNGIBLE_SUBSTRATE_TO_EVM_DEPOSIT_TXHASH = "255-1"
const FUNGIBLE_EVM_TO_SUBSTRATE_DEPOSIT = "0xfb37e3c406ef79864dc7102dafd386f2410e8e4415bb3910fa4cd1fc25838944"
const FUNGIBLE_BTC_TO_EVM_DEPOSIT_TXHASH = "c5991dd837694231e134bbb620ac1867142d9fac18ea48e90ca79fdec5c06be7"
const FUNGIBLE_EVM_TO_BTC_DEPOSIT_TXHASH = "0x3b020964f750b785cdf69d01df30c5a6a0e4f5b3183d6700c66830bb026004f0"

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
  let btcDeposits = 0

  before(async () => {
    let transfers = 0
    let isProcessing = false
    while (transfers !== 34 || isProcessing) {
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
      if (transfer.fromDomain.id == DOMAIN_4) {
        btcDeposits++
      }
      switch (transfer.resource?.type) {
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
    expect(btcDeposits).to.be.eq(NUMBER_OF_BITCOIN_DEPOSITS)

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
        depositNonce: 29,
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
          txHash: "0x985be57588ed9d726fca40d1ee0703f13670d0f66c94951393b9758687c8b3eb",
          blockNumber: "194",
          depositData:
            "0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35",
          handlerResponse: "0x0000000000000000000000000000000000000000000000000000000000000064",
          timestamp: "2024-09-18T13:43:16.000Z",
        },
        execution: {
          txHash: "0x0f088dcf2a0b1988b2dee6fdc2ee326f6c0934d4bdf014fc53a4a6f25a3dd274",
          blockNumber: "205",
          timestamp: "2024-09-18T13:43:41.000Z",
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
        amount: "7454603343408628326",
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
          txHash: "0x973bd4a61c3999fb05fb72372dea3966996f06f6ea20db868fa80e10404d9a58",
          blockNumber: "155",
          depositData:
            "0x0000000000000000000000000000000000000000000000006774123ea14f826600000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c",
          handlerResponse: "0x6d657461646174612e746573746d657461646174612e75726c",
          timestamp: "2024-09-18T13:41:56.000Z",
        },
        execution: {
          txHash: "0xabafd13471c23a29fb2d8d3cc8a05a307d07f3f3537be98d3bdbd21e771893a4",
          blockNumber: "162",
          timestamp: "2024-09-18T13:42:14.000Z",
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
          txHash: "0x18c3016efba659900ff22312b1ed2584e289860237e2207049314a7334615ec8",
          blockNumber: "187",
          depositData:
            "0x00000000000000000000000000000000000000000000000000000000000927c00004ea287d1514a2451c8553371e754f5e93a440adcca1c0dcf395145c1f5961696bad2e73f73417f07ef55c62a2dc5b38353634393639363133313434363530393337000000000000000000000000000000000000000000000000005c1f5961696bad2e73f73417f07ef55c62a2dc5b",
          handlerResponse: "0x",
          timestamp: "2024-09-18T13:43:02.000Z",
        },
        execution: {
          txHash: "0x4fb50a0cb0bfdb76b3569894702ba1f4167c99ef0eef66c74db8dfba5c354581",
          blockNumber: "192",
          timestamp: "2024-09-18T13:43:15.000Z",
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
        depositNonce: 1,
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
          amount: "50",
          decimals: 0,
          tokenAddress: "{}",
          tokenSymbol: "PHA",
          transferId: transfer[0].id,
        },
        deposit: {
          txHash: "255-1",
          blockNumber: "255",
          depositData:
            "0x00000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000145c1f5961696bad2e73f73417f07ef55c62a2dc5b",
          handlerResponse: "",
          timestamp: "2024-09-18T13:44:42.000Z",
        },
        execution: {
          txHash: "0x7d1f6a1bde972c3e2609e4fa2b0d1cfa2cd5f1700eaf87791e4581d58c90be6c",
          blockNumber: "261",
          timestamp: "2024-09-18T13:45:31.000Z",
        },
        account: {
          addressStatus: "",
        },
        usdValue: 0,
      },
    ])
  })

  it("should succesfully fetch evm to substrate fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_EVM_TO_SUBSTRATE_DEPOSIT}?domainID=${DOMAIN_1}`)
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
          txHash: "0xfb37e3c406ef79864dc7102dafd386f2410e8e4415bb3910fa4cd1fc25838944",
          blockNumber: "225",
          depositData:
            "0x00000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000002400010100d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
          handlerResponse: "0x00000000000000000000000000000000000000000000000000005af3107a4000",
          timestamp: "2024-09-18T13:44:18.000Z",
        },
        execution: {
          txHash: "254-1",
          blockNumber: "254",
          timestamp: "2024-09-18T13:44:36.000Z",
        },
        account: {
          addressStatus: "",
        },
        usdValue: 0,
      },
    ])
  })

  it("should succesfully fetch bitcoin to evm fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_BTC_TO_EVM_DEPOSIT_TXHASH}?domainID=${DOMAIN_4}`)
    const transfers = res.data as TransferResponse[]

    expect(res.status).to.be.deep.equal(200)
    expect(transfers).to.be.deep.equal([
      {
        id: transfers[0].id,
        depositNonce: 1505832356,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000001000",
        resource: {
          id: "0x0000000000000000000000000000000000000000000000000000000000001000",
          type: "fungible",
        },
        fromDomainId: 4,
        fromDomain: {
          id: 4,
          name: "Bitcoin-Testnet3",
          lastIndexedBlock: transfers[0].fromDomain.lastIndexedBlock,
        },
        toDomainId: 1,
        toDomain: {
          id: 1,
          name: "Ethereum 1",
          lastIndexedBlock: transfers[0].toDomain.lastIndexedBlock,
        },
        accountId: null,
        account: null,
        destination: "0x703265c472F169b20E8E03c842B9B374Cb842Cb8",
        amount: "30000000",
        message: "",
        usdValue: 0,
        status: "executed",
        fee: {
          id: transfers[0].fee.id,
          amount: "1000000",
          tokenAddress: "tb1pxmrzd94rs6wtg6ewdjfmuu7s88n2kdqc20vzfmadanfaem3n9sdq0vagu0",
          tokenSymbol: "BTC",
          decimals: 8,
          transferId: transfers[0].id,
        },
        deposit: {
          txHash: "c5991dd837694231e134bbb620ac1867142d9fac18ea48e90ca79fdec5c06be7",
          blockNumber: "252",
          depositData: "",
          handlerResponse: "",
          timestamp: "2024-08-22T02:24:25.000Z",
        },
        execution: {
          txHash: "0x1f4627b6bd32a29466f333d3c345cdea0111a9c5a2cf2913f344a89659e3a692",
          blockNumber: "109",
          timestamp: "2024-09-18T13:40:23.000Z",
        },
      },
    ])
  })

  it("should succesfully fetch evm to bitcoin fungible transfer", async () => {
    const res = await axios.get(`http://localhost:8000/api/transfers/txHash/${FUNGIBLE_EVM_TO_BTC_DEPOSIT_TXHASH}?domainID=${DOMAIN_1}`)
    const transfers = res.data as TransferResponse[]

    expect(res.status).to.be.deep.equal(200)
    expect(transfers).to.be.deep.equal([
      {
        id: transfers[0].id,
        depositNonce: 1,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000001000",
        resource: {
          id: "0x0000000000000000000000000000000000000000000000000000000000001000",
          type: "fungible",
        },
        fromDomainId: 1,
        fromDomain: {
          id: 1,
          name: "Ethereum 1",
          lastIndexedBlock: transfers[0].fromDomain.lastIndexedBlock,
        },
        toDomainId: 4,
        toDomain: {
          id: 4,
          name: "Bitcoin-Testnet3",
          lastIndexedBlock: transfers[0].toDomain.lastIndexedBlock,
        },
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        account: {
          addressStatus: "",
        },
        destination: "bcrt1pja8aknn7te4empmghnyqnrtjqn0lyg5zy3p5jsdp4le930wnpnxsrtd3ht",
        amount: "1.0",
        message: "",
        usdValue: 0,
        status: "executed",
        fee: {
          id: transfers[0].fee.id,
          amount: "100000000000000",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
          decimals: 18,
          transferId: transfers[0].id,
        },
        deposit: {
          txHash: "0x3b020964f750b785cdf69d01df30c5a6a0e4f5b3183d6700c66830bb026004f0",
          blockNumber: "110",
          depositData:
            "0x0000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000000000000000000000000000000000000000000406263727431706a6138616b6e6e37746534656d706d67686e79716e72746a716e306c7967357a793370356a736470346c65393330776e706e7873727464336874",
          handlerResponse: "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
          timestamp: "2024-09-18T13:40:25.000Z",
        },
        execution: {
          txHash: "696b2a56143475e2820f077d9f5f4fc3a8d08bc8c19af88e8e613285010974d0",
          blockNumber: "253",
          timestamp: "2024-08-22T06:21:10.000Z",
        },
      },
    ])
  })
})
