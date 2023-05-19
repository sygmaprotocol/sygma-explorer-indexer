import { PrismaClient, Transfer, Prisma } from "@prisma/client"
import { logger } from "../utils/logger"
import { app } from "../app"
import { getTransferQueryParams } from "../utils/helpers"

const loogerSpy = jest.spyOn(logger, "error")

describe("TransferController", () => {
  let prismaClient: Prisma.TransferDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
  beforeAll(() => {
    prismaClient = new PrismaClient().transfer
  })
  describe("transfers", () => {
    it("should return 200 when fetching for 10 transfers", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/transfers",
        query: {
          page: "1",
          limit: "10",
        },
      })
      const data: Transfer[] = await res.json()
      expect(res.statusCode).toEqual(200)
      expect(data).toHaveLength(10)
    })
    it("should return 200 and transfer of pending status", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/transfers",
        query: {
          page: "1",
          limit: "10",
          status: "pending",
        },
      })
      expect(res.statusCode).toEqual(200)
      const data: Transfer[] = await res.json()
      expect(data).toHaveLength(10)

      const everyIsPending = data.every((transfer: Transfer) => transfer.status === "pending")
      expect(everyIsPending).toBe(true)
    })
    it("should return 200 and transfer of executed status", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/transfers",
        query: {
          page: "1",
          limit: "10",
          status: "executed",
        },
      })
      expect(res.statusCode).toEqual(200)
      const data: Transfer[] = await res.json()
      expect(data).toHaveLength(10)

      const everyIsPending = data.every((transfer: Transfer) => transfer.status === "executed")
      expect(everyIsPending).toBe(true)
    })
    it("should return 404 when fetching for 10 transfers with invalid status", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/transfers",
        query: {
          page: "1",
          limit: "10",
          status: "no status",
        },
      })
      expect(res.statusCode).toEqual(404)
      expect(loogerSpy).toHaveBeenCalled()
    })
  })
  it("should return paginated results providing all the filters", async () => {
    const transferToCompare = await prismaClient.findMany({
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

    expect(transferToCompare.every((transfer: Transfer) => transfer.status === "executed")).toBe(true)

    const responseFirstPage = await app.inject({
      method: "GET",
      url: "/api/transfers",
      query: {
        page: "1",
        limit: "10",
        status: "executed",
      },
    })
    const dataFirstPage: Transfer[] = await responseFirstPage.json()

    expect(dataFirstPage).toHaveLength(10)
    expect(dataFirstPage.every((transfer: Transfer) => transfer.status === "executed")).toBe(true)

    const responseSecondPage = await app.inject({
      method: "GET",
      url: "/api/transfers",
      query: {
        page: "2",
        limit: "10",
        status: "executed",
      },
    })
    const dataSecondPage: Transfer[] = await responseSecondPage.json()

    expect(dataSecondPage).toHaveLength(10)
    expect(dataSecondPage.every((transfer: Transfer) => transfer.status === "executed")).toBe(true)

    const goingBack = await app.inject({
      method: "GET",
      url: "/api/transfers",
      query: {
        page: "1",
        limit: "10",
        status: "executed",
      },
    })
    const dataGoingBack: Transfer[] = await goingBack.json()

    expect(dataGoingBack).toHaveLength(10)
    expect(dataGoingBack.every((transfer: Transfer) => transfer.status === "executed")).toBe(true)
    expect(dataGoingBack[0].id).toEqual(dataFirstPage[0].id)

    const idxLastItemFirstPage = transferToCompare.findIndex((transfer: Transfer) => transfer.id === dataFirstPage[dataFirstPage.length - 1].id)
    const idxFirstItemSecondPage = transferToCompare.findIndex((transfer: Transfer) => transfer.id === dataSecondPage[0].id)

    expect(dataFirstPage[idxLastItemFirstPage].id).toEqual(transferToCompare[idxLastItemFirstPage].id)

    expect(dataSecondPage[0].id).toEqual(transferToCompare[idxFirstItemSecondPage].id)
  })

  describe("transferById", () => {
    it("should return 200 when fetching for a transfer by id", async () => {
      const transferToTest = await prismaClient.findFirst({
        where: {
          status: "executed",
        },
        include: {
          ...getTransferQueryParams().include,
        },
      })
      const { id } = transferToTest as Transfer
      const res = await app.inject({
        method: "GET",
        url: `/api/transfers/${id}`,
      })
      expect(res.statusCode).toEqual(200)

      const data: Transfer = await res.json()
      expect(data.id).toEqual(id)
    })
    it("should return 404 when fetching for a transfer by id that does not exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/transfers/1000",
      })
      expect(res.statusCode).toEqual(404)
      expect(loogerSpy).toHaveBeenCalled()
    })
  })

  describe("transferBySender", () => {
    it("should return 200 when fetching for a transfer by sender", async () => {
      const transferToTest = await prismaClient.findFirst({
        where: {
          status: "executed",
        },
        include: {
          ...getTransferQueryParams().include,
        },
      })
      const { sender } = transferToTest as Transfer

      const res = await app.inject({
        method: "GET",
        url: `/api/sender/${sender}/transfers`,
        query: {
          page: "1",
          limit: "10",
          status: "executed",
        },
      })
      expect(res.statusCode).toEqual(200)

      const data: Transfer[] = await res.json()

      expect(data.every((transfer: Transfer) => transfer.sender === sender)).toBe(true)
    })

    it("Should return 404 when fetching for a transfer that doesn't exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/sender/0x5A9E123C3c6a4f0920fA72D23cb7b47730e58b46/transfers",
        query: {
          page: "1",
          limit: "10",
          status: "executed",
        },
      })
      expect(res.statusCode).toEqual(404)
    })
  })
})
