import request from "supertest"
import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, './.env.test') });
import { PrismaClient } from "@prisma/client"

import { app } from "../app"
import { mockTransfers } from './mockTxs'

const prisma = new PrismaClient()

const DEFAULT_TRANSFERS_URL = "/transfers?first=10"

const transferData = {
  depositNonce: 25,
  resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
  fromDomainId: 0,
  fromNetworkName: "EVM Celo Testnet",
  toDomainId: 1,
  toNetworkName: "Ethereum - Rinkeby",
  fromAddress: "0x284D2Cb760D5A952f9Ea61fd3179F98a2CbF0B3E",
  toAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b",
  tokenAddress: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
  sourceTokenAddress: "0x00547208290094373f020b53465D742Ca73333F6",
  destinationTokenAddress: "0x01547208290094373f020b53465D742Ca73333F6",
  amount: "1000000000000000000n",
  timestamp: 1630511631,
  depositTransactionHash: "0x6679cc6180fecb446bd9b2f2cba420601e4781dae5c3be681be1ef6c27214da0",
  depositBlockNumber: 7031371,
  proposalEvents: {
    create: [
      {
        proposalStatus: 1,
        dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
        proposalEventTransactionHash: "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
        proposalEventBlockNumber: 9217370,
        timestamp: 1630511687,
        by: "0x66547208290094373f020b53465D742Ca73333F6",
      },
      {
        proposalStatus: 2,
        dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
        proposalEventTransactionHash: "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
        proposalEventBlockNumber: 9217370,
        timestamp: 1630511687,
        by: "0x66547208290094373f020b53465D742Ca73333F6",
      },
      {
        proposalStatus: 3,
        dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
        proposalEventTransactionHash: "0xad4d7d7d6dc402cd49e54d8094f817f5b60105ad0f56310568a3318a84751fd7",
        proposalEventBlockNumber: 9217371,
        timestamp: 1630511702,
        by: "0x66547208290094373f020b53465D742Ca73333F6",
      },
    ],
  },
  voteEvents: {
    create: [
      {
        voteBlockNumber: 9217370,
        voteTransactionHash: "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
        dataHash: null,
        timestamp: 1630511687,
        voteStatus: true,
        by: "0x66547208290094373f020b53465D742Ca73333F6",
      },
      {
        voteBlockNumber: 9217370,
        voteTransactionHash: "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
        dataHash: null,
        timestamp: 1630511687,
        voteStatus: true,
        by: "0x66547208290094373f020b53465D742Ca73333F6",
      },
    ],
  },
}

describe("Test TransfersController", () => {
  afterEach(async () => {
    await prisma.voteEvent.deleteMany({})
    await prisma.proposalEvent.deleteMany({})
    await prisma.transfer.deleteMany({})

  })

  afterAll( async () => {
    await prisma.$disconnect()
  })

  describe("with proposalEvents and voteEvents", () => {
    beforeEach(async () => {
      await prisma.transfer.create({
        data: transferData,
      })
      console.log("✨ 1 transfer successfully created!")
    })

    it("Request /transfers should return one transfer with proposalEvents and voteEvents", async () => {
      const result = await request(app).get(DEFAULT_TRANSFERS_URL).send()

      expect(result.status).toBe(200)
      expect(result.body.transfers[0]).toMatchObject({
        depositNonce: 25,
        resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromDomainId: 0,
        fromNetworkName: "EVM Celo Testnet",
        toDomainId: 1,
        toNetworkName: "Ethereum - Rinkeby",
        fromAddress: "0x284D2Cb760D5A952f9Ea61fd3179F98a2CbF0B3E",
        toAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b",
        tokenAddress: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
        amount: "1000000000000000000n",
        timestamp: 1630511631,
        depositTransactionHash: "0x6679cc6180fecb446bd9b2f2cba420601e4781dae5c3be681be1ef6c27214da0",
        depositBlockNumber: 7031371,
        sourceTokenAddress: "0x00547208290094373f020b53465D742Ca73333F6",
        destinationTokenAddress: "0x01547208290094373f020b53465D742Ca73333F6",
        status: 3,
        proposalEvents: [
          {
            proposalStatus: 1,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
            proposalEventBlockNumber: 9217370,
            timestamp: 1630511687,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            proposalStatus: 2,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
            proposalEventBlockNumber: 9217370,
            timestamp: 1630511687,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            proposalStatus: 3,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0xad4d7d7d6dc402cd49e54d8094f817f5b60105ad0f56310568a3318a84751fd7",
            proposalEventBlockNumber: 9217371,
            timestamp: 1630511702,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
        ],
        voteEvents: [
          {
            voteBlockNumber: 9217370,
            voteTransactionHash: "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
            dataHash: null,
            timestamp: 1630511687,
            voteStatus: true,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            voteBlockNumber: 9217370,
            voteTransactionHash: "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
            dataHash: null,
            timestamp: 1630511687,
            voteStatus: true,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
        ],
      })
    })
  })

  describe("NO proposalEvents and NO voteEvents", () => {
    beforeEach(async () => {
      const alteredTransferData = {
        ...transferData,
        proposalEvents: {},
        voteEvents: {},
      }
      await prisma.transfer.create({
        data: alteredTransferData,
      })
      console.log("✨ 1 transfer successfully created!")
    })

    it("Request /transfers should return one transfer with NO proposalEvents and NO voteEvents", async () => {
      const result = await request(app).get(DEFAULT_TRANSFERS_URL).send()

      expect(result.status).toBe(200)
      expect(result.body.transfers[0]).toMatchObject({
        depositNonce: 25,
        resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromDomainId: 0,
        fromNetworkName: "EVM Celo Testnet",
        toDomainId: 1,
        toNetworkName: "Ethereum - Rinkeby",
        fromAddress: "0x284D2Cb760D5A952f9Ea61fd3179F98a2CbF0B3E",
        toAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b",
        tokenAddress: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
        amount: "1000000000000000000n",
        timestamp: 1630511631,
        depositTransactionHash: "0x6679cc6180fecb446bd9b2f2cba420601e4781dae5c3be681be1ef6c27214da0",
        depositBlockNumber: 7031371,
        sourceTokenAddress: "0x00547208290094373f020b53465D742Ca73333F6",
        destinationTokenAddress: "0x01547208290094373f020b53465D742Ca73333F6",
        status: 1,
        proposalEvents: [],
        voteEvents: [],
      })
    })
  })

  describe("with voteEvents and NO proposalEvents", () => {
    beforeEach(async () => {
      const alteredTransferData = {
        ...transferData,
        proposalEvents: {},
      }
      await prisma.transfer.create({
        data: alteredTransferData,
      })
      console.log("✨ 1 transfer successfully created!")
    })

    it("Request /transfers should return one transfer with voteEvents and NO proposalEvents", async () => {
      await prisma.proposalEvent.deleteMany({})
      const result = await request(app).get(DEFAULT_TRANSFERS_URL).send()

      expect(result.status).toBe(200)
      expect(result.body.transfers[0]).toMatchObject({
        depositNonce: 25,
        resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromDomainId: 0,
        fromNetworkName: "EVM Celo Testnet",
        toDomainId: 1,
        toNetworkName: "Ethereum - Rinkeby",
        fromAddress: "0x284D2Cb760D5A952f9Ea61fd3179F98a2CbF0B3E",
        toAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b",
        tokenAddress: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
        amount: "1000000000000000000n",
        timestamp: 1630511631,
        depositTransactionHash: "0x6679cc6180fecb446bd9b2f2cba420601e4781dae5c3be681be1ef6c27214da0",
        depositBlockNumber: 7031371,
        sourceTokenAddress: "0x00547208290094373f020b53465D742Ca73333F6",
        destinationTokenAddress: "0x01547208290094373f020b53465D742Ca73333F6",
        status: 1,
        proposalEvents: [],
        voteEvents: [
          {
            voteBlockNumber: 9217370,
            voteTransactionHash: "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
            dataHash: null,
            timestamp: 1630511687,
            voteStatus: true,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            voteBlockNumber: 9217370,
            voteTransactionHash: "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
            dataHash: null,
            timestamp: 1630511687,
            voteStatus: true,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
        ],
      })
    })
  })

  describe("with multiple proposals", () => {
    beforeEach(async () => {
      const alteredTransferData = {
        ...transferData,
        proposalEvents: {
          create: [
          {
            proposalStatus: 1,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
            proposalEventBlockNumber: 9217370,
            timestamp: 1630511687,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            proposalStatus: 2,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
            proposalEventBlockNumber: 9217370,
            timestamp: 1630511687,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            proposalStatus: 3,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0xad4d7d7d6dc402cd49e54d8094f817f5b60105ad0f56310568a3318a84751fd7",
            proposalEventBlockNumber: 9217371,
            timestamp: 1630511687,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },

          {
            proposalStatus: 1,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
            proposalEventBlockNumber: 9217370,
            timestamp: 1630511688,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            proposalStatus: 2,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
            proposalEventBlockNumber: 9217370,
            timestamp: 1630511688,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
          {
            proposalStatus: 3,
            dataHash: "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
            proposalEventTransactionHash: "0xad4d7d7d6dc402cd49e54d8094f817f5b60105ad0f56310568a3318a84751fd7",
            proposalEventBlockNumber: 9217371,
            timestamp: 1630511688,
            by: "0x66547208290094373f020b53465D742Ca73333F6",
          },
        ]
      }
      }
      await prisma.transfer.create({
        data: alteredTransferData,
      })
      console.log("✨ 1 transfer successfully created!")
    })

    it("Request /transfers should return 3 status", async () => {
      // await prisma.proposalEvent.deleteMany({})
      const result = await request(app).get(DEFAULT_TRANSFERS_URL).send()

      expect(result.status).toBe(200)
      expect(result.body.transfers[0].status).toEqual(3)
    })

  })

  describe('filter over transfers', () => {
    const first = 10
    beforeEach(async () => {
      const { transfers } = mockTransfers

      for await (const tx of transfers) {
        await prisma.transfer.create({
          data: {
            ...tx,
            proposalEvents: { create: [ ...tx.proposalEvents ]},
            voteEvents: { create: [ ...tx.voteEvents]}
          }
        })
      }

      console.log("✨ 20 transfer successfully created!")
    })

    it('Request /transfers/filters?first=10&fromDomainId=[number]', async () => {
      const domainIDFrom = 1
      const result = await request(app).get(`/transfers/filters?first=${first}&fromDomainId=${domainIDFrom}`).send()

      const onlyDomainIdRequested = result.body.transfers.every((tx: any) => tx.fromDomainId === domainIDFrom)
      expect(onlyDomainIdRequested).toBe(true)
    })

    it('Request /transfers/filters?first=10&toDomainId=[number]', async () => {
      const domainIDTo = 0
      const result = await request(app).get(`/transfers/filters?first=${first}&toDomainId=${domainIDTo}`).send()


      const onlyDomainIDTo = result.body.transfers.every((tx:any) => tx.toDomainId === domainIDTo)
      expect(onlyDomainIDTo).toBe(true)
    })

    it('Request /transfers/filters?first=10&fromAddress=[string]&toAddress=[string]', async () => {
      const fromAddress = '0x5EfB75040BC6257EcE792D8dEd423063E6588A37'
      const toAddress= '0x5EfB75040BC6257EcE792D8dEd423063E6588A37'
      const result = await request(app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const onlyFromAddress = result.body.transfers.every((tx:any) => tx.fromAddress === fromAddress)
      expect(onlyFromAddress).toBe(true)
    })

    it('Request /transfers/filters?first=10&depositTransactionHas=[string]', async () => {
      const depositTxHash = '0xea5c6f72130cd36c64362facac8e8e7a60fb72c4092890de31a04b442c01d753'
      const result = await request(app).get(`/transfers/filters?first=${first}&depositTransactionHash=${depositTxHash}`).send()

      expect(result.body.transfers.length).toBe(1)
    })

    it('Request /transfers/filters?after=[string]&first=10&fromAddress=[string]&toAddress=[string]', async () => {
      const fromAddress = "0x5EfB75040BC6257EcE792D8dEd423063E6588A37"
      const toAddress = "0x5EfB75040BC6257EcE792D8dEd423063E6588A37"
      const firstResult = await request(app).get(`/transfers/filters?first=5&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const { body: { pageInfo: { endCursor }, transfers: t1 }} = firstResult

      const onlyFromAddressFirst = t1.every((tx: any) => tx.fromAddress === fromAddress)

      const secondResult = await request(app).get(`/transfers/filters?after=${endCursor}&first=5&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const { body: { transfers: t2 }} = secondResult

      const onylFromAddressSecond = t2.every((tx:any) => tx.fromAddress === fromAddress)

      const lastResult = await request(app).get(`/transfers/filters?first=10&fromAddress=${fromAddress}&toAddress=${toAddress}`)

      const { body: { transfers: t3 }} = lastResult

      const transferToCompare = [ ...t1.map((tx: any) => tx.id), ...t2.map((tx:any) => tx.id) ]
      const allTransfers = t3.map((tx:any) => tx.id)

      expect(onlyFromAddressFirst).toBe(true)
      expect(onylFromAddressSecond).toBe(true)
      expect(allTransfers).toEqual(transferToCompare)
    })

    it('Request /transfers/filters?before=[string]&first=10&fromAddress=[string]&toAddress=[string] - check forward and backwards navigation', async () => {
      const fromAddress = "0x42Da3Ba8c586F6fe9eF6ed1d09423eB73E4fe25b"
      const toAddress = "0x42Da3Ba8c586F6fe9eF6ed1d09423eB73E4fe25b"
      const firstResult = await request(app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const { body: {pageInfo: {endCursor}, transfers: t1}} = firstResult

      const onylFromAddressFirst = t1.every((tx:any) => tx.fromAddress === fromAddress)

      const secondResult = await request(app).get(`/transfers/filters?after=${endCursor}&first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const { body: { pageInfo: { startCursor }, transfers: t2}} = secondResult

      const onlyFromAddressSecond = t2.every((tx:any) => tx.fromAddress === fromAddress)

      const thirdResult = await request(app).get(`/transfers/filters?before=${startCursor}&first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const {body: {transfers: t3}} = thirdResult

      expect(onylFromAddressFirst).toBe(true)
      expect(onlyFromAddressSecond).toBe(true)
      expect(t1.map((tx:any) => tx.id)).toEqual(t3.map((tx:any) => tx.id))
    })

    it('Request /transfers/filters?after=[string]&first=10&fromAddres=[string] - returns empty array because there is no more data', async () => {
      const fromAddress = "0xff93B45308FD417dF303D6515aB04D9e89a750Ca"
      const toAddress = "0xff93B45308FD417dF303D6515aB04D9e89a750Ca"
      const firstResult = await request(app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()
  
      const { body: { pageInfo: { endCursor } }} = firstResult
  
      const secondResult = await request(app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}&after=${endCursor}`).send()
  
      const { body: { transfers, pageInfo: { hasNextPage } } } = secondResult
  
      expect(transfers.length).toBe(0)
      expect(hasNextPage).toBe(false)
    })

    it('Request /transfers/filters?first=10&fromAddress=[string]&toAddress=[string] with the same address but different cases', async () => {
      const fromAddress = "0x5EfB75040BC6257EcE792D8dEd423063E6588A37"
      const toAddress = "0x5efb75040bc6257ece792d8ded423063e6588a37"
      const result = await request(app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const { body: { transfers } } = result

      const everyFromAddress = transfers.every((tx:any) => tx.fromAddress === fromAddress)
      const everyToAddress = transfers.every((tx:any) => tx.toAddress === toAddress)

      expect(everyFromAddress).toBe(true)
      expect(everyToAddress).toBe(true)
    })

    it('Request /transfers/filters?first=10&before=[string]', async () => {
      const result = await request(app).get(`/transfers/filters?first=${20}`).send()

      const { body: { transfers: t1 } } = result

      const { id } = t1[10]

      const result2 = await request(app).get(`/transfers/filters?first=${first}&before=${id}`).send()

      const { body: { transfers: t2 } } = result2

      const indexOfId = t1.findIndex((tx:any) => tx.id === id)

      const sliced = t1.slice(0, indexOfId).map((tx:any) => tx.id)
      const filteredResult = t2.map((tx:any) => tx.id)

      expect(filteredResult).toEqual(sliced)
    })

    it('Request /transfers/filters?last=10&before=[string]', async () => {
      const result = await request(app).get(`/transfers/filters?last=${20}`).send()

      const { body: { transfers } } = result

      const { id } = transfers[transfers.length - 1]

      const result2 = await request(app).get(`/transfers/filters?last=${10}&before=${id}`).send()

      const { body: { transfers: t2 }} = result2

      const sliced = transfers.slice(9, transfers.length - 1).map((tx:any) => tx.id)

      expect(t2.map((tx:any) => tx.id)).toEqual(sliced)
    })

    it('Request /transfers/filters?last=10&before=[string]&fromAddress=[string]&toAddress=[string]', async () => {
      const result = await request(app).get(`/transfers/filters?last=20`).send()

      const { body: { transfers } } = result

      const { id } = transfers[transfers.length - 1]

      const fromAddress = "0x42Da3Ba8c586F6fe9eF6ed1d09423eB73E4fe25b"
      const toAddress = "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b"

      const result2 = await request(app).get(`/transfers/filters?last=10&before=${id}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()

      const { body: { transfers: t2 } } = result2

      const sliced = transfers.filter((tx:any) => tx.fromAddress === fromAddress && tx.toAddress === toAddress && tx.id !== id).map((t:any) => t.id)

      expect(t2.map((tx:any) => tx.id)).toEqual(sliced)
    })
  })
})


