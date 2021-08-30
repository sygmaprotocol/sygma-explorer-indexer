import request from 'supertest';
import { app } from '../app';
import transferData from '../fixtures/transferData'

describe('Test TransfersController', () => {
  it('Request /transfers should return some transfers!', async () => {
    const result = await request(app).get('/transfers').send();

    expect(result.status).toBe(200);
    expect(result.body).toStrictEqual(transferData);
  });
});
