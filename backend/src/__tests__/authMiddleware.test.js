const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { authRequired, roleRequired } = require('../middleware/auth');

describe('auth middleware', () => {
  function mockResponse() {
    return {};
  }

  it('should reject request without token', () => {
    const req = { headers: {} };
    const next = jest.fn();

    authRequired(req, mockResponse(), next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('missing token');
  });

  it('should reject invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };
    const next = jest.fn();

    authRequired(req, mockResponse(), next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('invalid token');
  });

  it('should accept valid token and attach decoded auth', (done) => {
    const token = jwt.sign(
      {
        sub: 'u1',
        role: 'admin',
        email: 'admin@test.pt',
      },
      env.jwtSecret
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    authRequired(req, mockResponse(), () => {
      expect(req.auth.sub).toBe('u1');
      expect(req.auth.role).toBe('admin');
      done();
    });
  });

  it('should allow access when role is permitted', () => {
    const req = {
      auth: {
        role: 'admin',
      },
    };

    const next = jest.fn();

    roleRequired('admin')(req, mockResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should reject access when role is not permitted', () => {
    const req = {
      auth: {
        role: 'user',
      },
    };

    const next = jest.fn();

    roleRequired('admin')(req, mockResponse(), next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].status).toBe(403);
    expect(next.mock.calls[0][0].message).toBe('forbidden');
  });
});