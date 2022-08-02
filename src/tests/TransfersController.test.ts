import request from "supertest"
import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, './.env.test') });
import { PrismaClient } from "@prisma/client"

import { app } from "../app"
import { mockTransfers } from './mockTxs'

const prisma = new PrismaClient()

const DEFAULT_TRANSFERS_URL = "/transfers?first=10"

const transferData = {
  depositNonce: 3,
  resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
  fromDomainId: 1,
  fromNetworkName: "Local EVM 1",
  toDomainId: 2,
  toNetworkName: "Local EVM 2",
  fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
  toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
  amount: "1000000000000000000",
  timestamp: 1658771219,
  depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
  depositBlockNumber: 583,
  status: 1,
  sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
  destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
  handleResponse: null,
  proposalExecutionEvent: {
    originDomainID: 1,
    depositNonce: 3,
    dataHash: "0x5ef98301782da0d86bea1c3dd38d7008f61ecc067f70329d59b7293286fece9d",
    by: "0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7",
  },
  failedHandlerExecutionEvent: null,
}

describe("Test TransfersController", () => {
  afterEach(async () => {
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

    it("Request /transfers should return one transfer with proposalExecution event", async () => {
      const result = await request(app).get(DEFAULT_TRANSFERS_URL).send()

      expect(result.status).toBe(200)
      expect(result.body.transfers[0]).toMatchObject({
        depositNonce: 3,
        resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromDomainId: 1,
        fromNetworkName: "Local EVM 1",
        toDomainId: 2,
        toNetworkName: "Local EVM 2",
        fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
        toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
        amount: "1000000000000000000",
        timestamp: 1658771219,
        depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
        depositBlockNumber: 583,
        status: 1,
        sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
        destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
        handleResponse: null,
        proposalExecutionEvent: {
          originDomainID: 1,
          depositNonce: 3,
          dataHash: "0x5ef98301782da0d86bea1c3dd38d7008f61ecc067f70329d59b7293286fece9d",
          by: "0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7",
        },
        failedHandlerExecutionEvent: null,
      })
    })
  })

  describe("NO proposalExecution Events ", () => {
    beforeEach(async () => {
      const alteredTransferData = {
        ...transferData,
        status: 0,
        proposalExecutionEvent: null,
        failedHandlerExecutionEvent: null,
      }
      await prisma.transfer.create({
        data: alteredTransferData,
      })
      console.log("✨ 1 transfer successfully created!")
    })

    it("Request /transfers should return one transfer with NO proposalExecution", async () => {
      const result = await request(app).get(DEFAULT_TRANSFERS_URL).send()

      expect(result.status).toBe(200)
      expect(result.body.transfers[0]).toMatchObject({
        depositNonce: 3,
        resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromDomainId: 1,
        fromNetworkName: "Local EVM 1",
        toDomainId: 2,
        toNetworkName: "Local EVM 2",
        fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
        toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
        amount: "1000000000000000000",
        timestamp: 1658771219,
        depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
        depositBlockNumber: 583,
        status: 0,
        sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
        destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
        handleResponse: null,
        proposalExecutionEvent: null,
        failedHandlerExecutionEvent: null,
      })
    })
  })

  describe("with failedHandlerExecution event", () => {
    beforeEach(async () => {
      const alteredTransferData = {
        ...transferData,
        proposalExecutionEvent: null,
        failedHandlerExecutionEvent: {
          lowLevelData: '0x0000000000000000000000000000000000000000000000000000000000000000',
          originDomainID: 1,
          depositNonce: 3,
          by: '0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7'
        }
      }
      await prisma.transfer.create({
        data: alteredTransferData,
      })
      console.log("✨ 1 transfer successfully created!")
    })

    it("Request /transfers should return one transfer with failedHandlerExecution event", async () => {
      // await prisma.proposalEvent.deleteMany({})
      const result = await request(app).get(DEFAULT_TRANSFERS_URL).send()

      expect(result.status).toBe(200)
      expect(result.body.transfers[0]).toMatchObject({
        depositNonce: 3,
        resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromDomainId: 1,
        fromNetworkName: "Local EVM 1",
        toDomainId: 2,
        toNetworkName: "Local EVM 2",
        fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
        toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
        amount: "1000000000000000000",
        timestamp: 1658771219,
        depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
        depositBlockNumber: 583,
        status: 1,
        sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
        destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
        handleResponse: null,
        proposalExecutionEvent: null,
        failedHandlerExecutionEvent: {
          lowLevelData: '0x0000000000000000000000000000000000000000000000000000000000000000',
          originDomainID: 1,
          depositNonce: 3,
          by: '0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7'
        }
      })
    })
  })


  describe('filter over transfers', () => {
    const first = 10
    beforeEach(async () => {
      const { transfers } = mockTransfers

      for await (const tx of transfers) {
        await prisma.transfer.create({
          data: tx
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
      const domainIDTo = 1
      const result = await request(app).get(`/transfers/filters?first=${first}&toDomainId=${domainIDTo}`).send()


      const onlyDomainIDTo = result.body.transfers.every((tx:any) => tx.toDomainId === domainIDTo)
      expect(onlyDomainIDTo).toBe(true)
    })

    it('Request /transfers/filters?first=10&fromAddress=[string]&toAddress=[string]', async () => {
      const fromAddress = '0x5EfB75040BC6257EcE792D8dEd423063E6588A37'
      const toAddress= '0x5EfB75040BC6257EcE792D8dEd423063E6588A37'
      const result = await request(app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send()
      expect(result.body.transfers.length).toBeGreaterThan(0)

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

      const everyFromAddress = transfers.every((tx:any) => tx.fromAddress.toLowerCase() === fromAddress.toLowerCase())
      const everyToAddress = transfers.every((tx:any) => tx.toAddress.toLowerCase() === toAddress .toLowerCase())

      expect(everyFromAddress).toBe(true)
      expect(everyToAddress).toBe(true)
    })

    it('Request /transfers/filters?first=10&before=[string]', async () => {
      const result = await request(app).get(`/transfers/filters?first=20`).send()

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


