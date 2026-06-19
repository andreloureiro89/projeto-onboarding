const request = require('supertest');
const bcrypt = require('bcryptjs');
const { buildApp } = require('../app');

describe('Auth API', () => {
  function createFakeDb() {
    const user = {
      id: 'u1',
      _id: 'u1',
      name: 'User Test',
      email: 'user@local.test',
      passwordHash: bcrypt.hashSync('user123', 10),
      role: 'user',
      active: true,
    };

    return {
      findUserByEmail: jest.fn(async (email) => {
        if (email === 'user@local.test') {
          return user;
        }

        return null;
      }),

      getUserById: jest.fn(async (id) => {
        if (id === 'u1') {
          return user;
        }

        return null;
      }),
    };
  }

  it('should login with demo user account', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@local.test',
        password: 'user123',
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('user@local.test');
  });

  it('should reject login with wrong credentials', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@test.pt',
        password: 'wrongpass',
      });

    expect(response.status).toBe(401);
  });

  it('should return current user profile with valid token', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@local.test',
        password: 'user123',
      });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('user@local.test');
  });


});