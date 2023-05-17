import { PrismaClient, Transfer, Prisma } from '@prisma/client';
import { app} from '../app'
import { returnQueryParamsForTransfers } from '../utils/helpers';

describe('TransferController', () => {
  let prismaClient: Prisma.TransferDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
  beforeAll(() => {
    prismaClient = new PrismaClient().transfer;
  })
  describe('transfers', () => {
    it('should return 200 when fetching for 10 transfers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/transfers',
        query: {
          page: '1',
          limit: '10',
        }
      });
      const data = await res.json()
      expect(res.statusCode).toEqual(200)
      expect(data).toHaveLength(10)
    });
    it("should return 200 and transfer of pending status", async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/transfers',
        query: {
          page: '1',
          limit: '10',
          status: 'pending'
        }
      });
      expect(res.statusCode).toEqual(200);
      const data = await res.json();
      expect(data).toHaveLength(10);

      const everyIsPending = data.every((transfer: any) => transfer.status === 'pending');
      expect(everyIsPending).toBe(true);
    });
    it('should return 200 and transfer of executed status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/transfers',
        query: {
          page: '1',
          limit: '10',
          status: 'executed'
        }
      });
      expect(res.statusCode).toEqual(200);
      const data = await res.json();
      expect(data).toHaveLength(10);

      const everyIsPending = data.every((transfer: any) => transfer.status === 'executed');
      expect(everyIsPending).toBe(true);
    });
    it('should return 400 when fetching for 10 transfers with invalid status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/transfers',
        query: {
          page: '1',
          limit: '10',
          status: 'no status'
        }
      });
      expect(res.statusCode).toEqual(400);
    })
  });
  it('should return paginated results providing all the filters', async () => {

    const transferToCompare = await prismaClient.findMany({
      take: 20,
      orderBy: [
        {
          timestamp: "asc",
        },
      ],
      include: {
        ...returnQueryParamsForTransfers().include,
      },
      where: {
        status: 'executed',
      }
    });
    
    expect(
      transferToCompare.every((transfer: any) => transfer.status === 'executed')
    ).toBe(true);

    const responseFirstPage = await app.inject({
      method: 'GET',
      url: '/api/transfers',
      query: {
        page: '1',
        limit: '10',
        status: 'executed'
      }
    });
    const dataFirstPage = await responseFirstPage.json() as Transfer[];
    
    expect(dataFirstPage).toHaveLength(10);
    expect(
      dataFirstPage.every((transfer: any) => transfer.status === 'executed')
    ).toBe(true);

    const responseSecondPage = await app.inject({
      method: 'GET',
      url: '/api/transfers',
      query: {
        page: '2',
        limit: '10',
        status: 'executed'
      }
    });
    const dataSecondPage = await responseSecondPage.json() as Transfer[];
    
    expect(dataSecondPage).toHaveLength(10);
    expect(
      dataSecondPage.every((transfer: any) => transfer.status === 'executed')
    ).toBe(true);

    const goingBack = await app.inject({
      method: 'GET',
      url: '/api/transfers',
      query: {
        page: '1',
        limit: '10',
        status: 'executed'
      }
    });
    const dataGoingBack = await goingBack.json() as Transfer[];

    expect(dataGoingBack).toHaveLength(10);
    expect(
      dataGoingBack.every((transfer: any) => transfer.status === 'executed')
    ).toBe(true);
    expect(dataGoingBack[0].id).toEqual(dataFirstPage[0].id);

    const idxLastItemFirstPage = transferToCompare.findIndex((transfer: Transfer) => transfer.id === dataFirstPage[dataFirstPage.length -1].id);
    const idxFirstItemSecondPage = transferToCompare.findIndex((transfer: Transfer) => transfer.id === dataSecondPage[0].id);

    expect(
      dataFirstPage[idxLastItemFirstPage].id
    ).toEqual(
      transferToCompare[idxLastItemFirstPage].id
    );

    expect(
      dataSecondPage[0].id
    ).toEqual(
      transferToCompare[idxFirstItemSecondPage].id
    );
  })

  describe('transferById', () => {
    it('should return 200 when fetching for a transfer by id', async () => {
      const transferToTest = await prismaClient.findFirst({
        where: {
          status: 'executed',
        },
        include: {
          ...returnQueryParamsForTransfers().include,
        },
      });
      const { id }  = transferToTest as Transfer;
      const res = await app.inject({
        method: 'GET',
        url: `/api/transfers/${id}`,
      });
      expect(res.statusCode).toEqual(200);

      const data = await res.json() as Transfer;
      expect(data.id).toEqual(id);
    });
    it('should return 404 when fetching for a transfer by id that does not exist', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/transfers/1000',
      });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('transferBySender', () => {
    it('should return 200 when fetching for a transfer by sender', async () => {
      const transferToTest = await prismaClient.findFirst({
        where: {
          status: 'executed',
        },
        include: {
          ...returnQueryParamsForTransfers().include,
        },
      });
      const { sender, status }  = transferToTest as Transfer;

      const res = await app.inject({
        method: 'GET',
        url: `/api/sender/${sender}/transfers`,
        query: {
          page: '1',
          limit: '10',
          status: 'executed'
        }
      });
      expect(res.statusCode).toEqual(200);

      const data = await res.json() as Transfer[];

      expect(
        data.every((transfer: any) => transfer.sender === sender)
      ).toBe(true);
    });

    it('Should return 400 when fetching for a transfer that doesn\'t exist', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/sender/0x5A9E123C3c6a4f0920fA72D23cb7b47730e58b46/transfers',
        query: {
          page: '1',
          limit: '10',
          status: 'executed'
        }
      });
      expect(res.statusCode).toEqual(404);
    });
  })
});