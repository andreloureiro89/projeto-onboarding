const bcrypt = require('bcryptjs');
const { AuthService } = require('../services/authService');

describe('AuthService', () => {
  function createFakeDb() {
    const user = {
      _id: {
        toString: () => 'u1',
      },
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
        _id: {
          toString: () => 'u2',
        },
        name: payload.name,
        email: payload.email,
        passwordHash: payload.passwordHash,
        role: payload.role,
        active: true,
      })),
    };
  }

  it('should login valid user', async () => {
    const service = new AuthService(createFakeDb());

    const result = await service.login({
      email: 'user@local.test',
      password: 'user123',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('user@local.test');
    expect(result.user.passwordHash).toBeUndefined();
  });

  it('should reject login with unknown email', async () => {
    const service = new AuthService(createFakeDb());

    await expect(
      service.login({
        email: 'wrong@test.pt',
        password: 'wrongpass',
      })
    ).rejects.toThrow('invalid credentials');
  });

  it('should reject login with wrong password', async () => {
    const service = new AuthService(createFakeDb());

    await expect(
      service.login({
        email: 'user@local.test',
        password: 'wrongpass',
      })
    ).rejects.toThrow('invalid credentials');
  });

  it('should register new user', async () => {
    const service = new AuthService(createFakeDb());

    const result = await service.register({
      name: 'New User',
      email: 'new@test.pt',
      password: '123456',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('new@test.pt');
    expect(result.user.role).toBe('user');
    expect(result.user.passwordHash).toBeUndefined();
  });

  it('should return current user profile', async () => {
    const service = new AuthService(createFakeDb());

    const user = await service.me('u1');

    expect(user.email).toBe('user@local.test');
    expect(user.passwordHash).toBeUndefined();
  });

  it('should throw error when profile user does not exist', async () => {
    const service = new AuthService(createFakeDb());

    await expect(service.me('invalid-id')).rejects.toThrow('user not found');
  });
});