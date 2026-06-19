const request = require('supertest');
const bcrypt = require('bcryptjs');
const { buildApp } = require('../app');

describe('Auth API', () => {
  function createFakeDb() {
    const user = {
      _id: { toString: () => 'u1' },
      id: 'u1',
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

      createUser: jest.fn(async (payload) => ({
        _id: { toString: () => 'u2' },
        id: 'u2',
        name: payload.name,
        email: payload.email,
        passwordHash: payload.passwordHash,
        role: payload.role,
        active: true,
      })),

      getCompany: jest.fn(() => ({
        name: 'NovaTech Solutions',
        tagline: 'Building tomorrow',
        logo: '',
      })),

      listModules: jest.fn(async () => []),
      listProgressByUser: jest.fn(async () => []),
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
    expect(response.body.user.passwordHash).toBeUndefined();
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
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('should reject profile request without token', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  it('should register a new user', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'new@test.pt',
        password: '123456',
      });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('new@test.pt');
    expect(response.body.user.role).toBe('user');
  });

  it('should register a new admin when valid role is provided', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Admin',
        email: 'admin@test.pt',
        password: '123456',
        role: 'admin',
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('admin');
  });

  it('should reject register with invalid email', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'invalid-email',
        password: '123456',
      });

    expect(response.status).toBe(400);
  });

  it('should reject register with invalid role', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'new@test.pt',
        password: '123456',
        role: 'manager',
      });

    expect(response.status).toBe(400);
  });

  it('should reject login with missing password', async () => {
    const fakeDb = createFakeDb();
    const { app } = buildApp(fakeDb);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@local.test',
      });

    expect(response.status).toBe(400);
  });
});