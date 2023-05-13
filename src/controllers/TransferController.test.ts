import { app} from '../app'

describe('TransferController', () => {
  describe('transfer', () => {
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
});