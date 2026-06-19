const request = require('supertest');
const { buildApp } = require('../app');

describe('Health API', () => {
  it('should return API health status', async () => {
    const { app } = buildApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
  });
});