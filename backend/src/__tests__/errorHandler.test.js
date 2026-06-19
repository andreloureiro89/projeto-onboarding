const { errorHandler } = require('../middleware/errorHandler');

describe('errorHandler middleware', () => {
  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }

  it('should return custom error status and message', () => {
    const res = createResponse();

    errorHandler(
      {
        status: 404,
        message: 'module not found',
      },
      {},
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      error: 'module not found',
    });
  });

  it('should return 500 when status is missing', () => {
    const res = createResponse();

    errorHandler(
      {
        message: 'unexpected error',
      },
      {},
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      error: 'unexpected error',
    });
  });

  it('should return default internal server error message', () => {
    const res = createResponse();

    errorHandler(
      {},
      {},
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });
});