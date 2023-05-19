import { PrismaClient, Transfer } from "@prisma/client"
import { getTransferQueryParams } from "../utils/helpers"
import TransfersService from "./transfers.service"

describe("TransferService", () => {
  let prismaClient: PrismaClient
  let transferService: TransfersService

  beforeAll(() => {
    prismaClient = new PrismaClient()
    transferService = new TransfersService()
  })
  describe("findTransfersByCursor", () => {
    it("should return transfers with pagination going forward", async () => {
      const firstTenBatchTransfers = await transferService.findTransfersByCursor({ page: "1", limit: "10" })
      expect(firstTenBatchTransfers).toHaveLength(10)

      const secondBatchOfTransfers = await transferService.findTransfersByCursor({ page: "2", limit: "10" })
      expect(secondBatchOfTransfers).toHaveLength(10)

      const transfersToCompare = await prismaClient.transfer.findMany({
        take: 20,
        orderBy: [
          {
            timestamp: "asc",
          },
        ],
        include: {
          ...getTransferQueryParams().include,
        },
      })

      expect(transfersToCompare).toHaveLength(20)

      // check the first 10 batch
      const firstTenBatch = transfersToCompare.slice(0, transfersToCompare.length / 2)

      const lastIdFirstTen = firstTenBatch[firstTenBatch.length - 1].id
      expect(lastIdFirstTen).toMatch(firstTenBatchTransfers[9].id)

      const isEveryTheSameForFirstTen = firstTenBatch.every((transfer, index) => {
        const idToCompare = firstTenBatchTransfers[index].id
        const currentId = transfer.id
        return idToCompare === currentId
      })

      expect(isEveryTheSameForFirstTen).toBe(true)

      const secondTenBatch = transfersToCompare.slice(transfersToCompare.length / 2, transfersToCompare.length)

      const firstIdSecondTen = secondTenBatch[0].id
      expect(firstIdSecondTen).toMatch(secondBatchOfTransfers[0].id)

      const isEveryTheSameForTheSecondTen = secondBatchOfTransfers.every((transfer, index) => {
        const idToCompare = secondTenBatch[index].id
        const currentId = transfer.id
        return idToCompare === currentId
      })
      expect(isEveryTheSameForTheSecondTen).toBe(true)

      const findIndexLastId = transfersToCompare.findIndex(transfer => transfer.id === lastIdFirstTen)
      const findIndexFirstId = transfersToCompare.findIndex(transfer => transfer.id === firstIdSecondTen)

      // Test continuity
      expect(findIndexLastId).toBe(9)
      expect(findIndexFirstId).toBe(10)
    })

    it("Should return transfers with pagination going backward", async () => {
      const thirtyRecords = await prismaClient.transfer.findMany({
        take: 30,
        orderBy: [
          {
            timestamp: "asc",
          },
        ],
        include: {
          ...getTransferQueryParams().include,
        },
      })

      const firstTenRecords = thirtyRecords.slice(0, 10)
      const secondTenRecords = thirtyRecords.slice(10, 20)

      const firstTen = await transferService.findTransfersByCursor({ page: "1", limit: "10" })
      expect(firstTen).toHaveLength(10)
      const secondTen = await transferService.findTransfersByCursor({ page: "2", limit: "10" })
      expect(secondTen).toHaveLength(10)
      const goingBack = await transferService.findTransfersByCursor({ page: "1", limit: "10" })
      expect(goingBack).toHaveLength(10)

      const isEveryTheSameForFirstTen = firstTen.every((transfer, index) => {
        const idToCompare = firstTenRecords[index].id
        const currentId = transfer.id
        return idToCompare === currentId
      })
      expect(isEveryTheSameForFirstTen).toBe(true)

      const isEveryTheSameForSecondTen = secondTen.every((transfer, index) => {
        const idToCompare = secondTenRecords[index].id
        const currentId = transfer.id
        return idToCompare === currentId
      })
      expect(isEveryTheSameForSecondTen).toBe(true)

      const isGoingBackMatchWithFirstTen = goingBack.every((transfer, index) => {
        const idToCompare = firstTenRecords[index].id
        const currentId = transfer.id
        return idToCompare === currentId
      })
      expect(isGoingBackMatchWithFirstTen).toBe(true)

      // test random page
      const randomPage = await transferService.findTransfersByCursor({ page: "7", limit: "10" })
      expect(randomPage).toHaveLength(10)
      const fristEightyRecords = await prismaClient.transfer.findMany({
        take: 80,
        orderBy: [
          {
            timestamp: "asc",
          },
        ],
        include: {
          ...getTransferQueryParams().include,
        },
      })
      expect(fristEightyRecords).toHaveLength(80)
      const sliceOfSeventy = fristEightyRecords.slice(60, 70)
      expect(sliceOfSeventy).toHaveLength(10)

      const goingBackOnTheBigChunk = await transferService.findTransfersByCursor({ page: "6", limit: "10" })
      expect(goingBackOnTheBigChunk).toHaveLength(10)

      const sliceOfSixty = fristEightyRecords.slice(50, 60)
      expect(sliceOfSixty).toHaveLength(10)

      // test continuity
      // get record num 59 (in real life number 60)
      const indexId59Record = fristEightyRecords.findIndex(transfer => transfer.id === goingBackOnTheBigChunk[goingBack.length - 1].id)
      // get record num 60
      const indexI60Record = fristEightyRecords.findIndex(transfer => transfer.id === sliceOfSeventy[0].id)
      const id59 = goingBackOnTheBigChunk[goingBack.length - 1].id
      const id60 = randomPage[0].id

      const originalFromFirstSeventyId59 = fristEightyRecords[indexId59Record].id
      const originalFromFirstSeventyId60 = fristEightyRecords[indexI60Record].id

      expect(id59).toEqual(originalFromFirstSeventyId59)
      expect(id60).toEqual(originalFromFirstSeventyId60)
    })
    it("Should filter the transfer by status", async () => {
      const failedTransfersToTest = await prismaClient.transfer.findMany({
        take: 20,
        orderBy: [
          {
            timestamp: "asc",
          },
        ],
        include: {
          ...getTransferQueryParams().include,
        },
        where: {
          status: "failed",
        },
      })

      const onlyFailedFromService = await transferService.findTransfersByCursor({ page: "1", limit: "20", status: "failed" })
      expect(onlyFailedFromService).toHaveLength(failedTransfersToTest.length)

      const executedTransfers = await prismaClient.transfer.findMany({
        take: 20,
        orderBy: [
          {
            timestamp: "asc",
          },
        ],
        include: {
          ...getTransferQueryParams().include,
        },
        where: {
          status: "executed",
        },
      })

      const onlyExecutedFromService = await transferService.findTransfersByCursor({ page: "1", limit: "20", status: "executed" })

      expect(onlyExecutedFromService).toHaveLength(executedTransfers.length)
      expect(onlyExecutedFromService.every(transfer => transfer.status === "executed")).toBe(true)
      expect(onlyFailedFromService.every(transfer => transfer.status === "failed")).toBe(true)
    })

    it("Should return error when no transfer are found by the normal params", async () => {
      const transfers = transferService.findTransfersByCursor({ page: "1000", limit: "20" })
      await expect(transfers).rejects.toThrowError()
    })
  })

  describe("findTransferById", () => {
    it("Should return a transfer by id", async () => {
      const transferToTest = await prismaClient.transfer.findFirst({
        where: {
          status: "executed",
        },
        include: {
          ...getTransferQueryParams().include,
        },
      })
      const { id, status } = transferToTest as Transfer

      const transferFromService = await transferService.findTransferById({ id })
      expect(transferFromService?.id).toEqual(id)
      expect(transferFromService?.status).toEqual(status)
    })

    it("Should throw error if transfer is found by id", async () => {
      const transferFromService = transferService.findTransferById({ id: "5ec9e5aaf29e0b5a17c0f4d2" })
      await expect(transferFromService).rejects.toThrowError()
    })
  })

  describe("findTransferByFilterParams", () => {
    it("Should transfer by filter params: filter = sender address", async () => {
      const transferToTest = await prismaClient.transfer.findFirst({
        include: {
          ...getTransferQueryParams().include,
        },
      })
      const { sender } = transferToTest as Transfer

      const transferFromSender = await prismaClient.transfer.findMany({
        where: {
          sender,
        },
        include: {
          ...getTransferQueryParams().include,
        },
      })

      expect(transferFromSender.every(transfer => transfer.sender === sender)).toBe(true)

      const transferFromServiceBySender = await transferService.findTransferByFilterParams({ page: "1", limit: "10", undefined, sender })

      expect(transferFromServiceBySender.every(transfer => transfer.sender === sender)).toBe(true)

      expect(transferFromServiceBySender.length).toEqual(transferFromSender.length)
    })

    it("Should transfer by filter params: filter = sender address & status executed", async () => {
      const transferToTest = await prismaClient.transfer.findFirst({
        where: {
          status: "executed",
        },
        include: {
          ...getTransferQueryParams().include,
        },
      })

      const { sender, status } = transferToTest as Transfer

      const transferFromSender = await prismaClient.transfer.findMany({
        where: {
          sender,
          status,
        },
        include: {
          ...getTransferQueryParams().include,
        },
      })

      expect(transferFromSender.every(transfer => transfer.sender === sender && transfer.status === status)).toBe(true)

      transferService = new TransfersService() // To test with reseted cursor

      const transferFromServiceBySender = await transferService.findTransferByFilterParams({ page: "1", limit: "10", status, sender })

      expect(transferFromServiceBySender.length).toEqual(transferFromSender.length)

      expect(transferFromServiceBySender.every(transfer => transfer.sender === sender && transfer.status === status)).toBe(true)
    })

    it("Should throw error when no tranafer is found by sender", async () => {
      const transferFromServiceBySender = transferService.findTransferByFilterParams({ page: "1", limit: "10", sender: "notFound" })
      await expect(transferFromServiceBySender).rejects.toThrowError()
    })
  })
})
