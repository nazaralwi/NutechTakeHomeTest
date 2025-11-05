class ClientError extends Error {
  constructor(message, statusCode, status) {
    super(message);

    if (this.constructor.name === 'ClientError') {
      throw new Error('cannot instantiate abstract class');
    }

    this.statusCode = statusCode;
    this.status = status;
    this.name = 'ClientError';
  }
}

class TokenError extends ClientError {
  constructor(message) {
    super(message, 401, 108);
    this.name = 'TokenError';
  }
}

class AuthError extends ClientError {
  constructor(message) {
    super(message, 401, 103);
    this.name = 'AuthError';
  }
}

class InvariantError extends ClientError {
  constructor(message) {
    super(message, 400, 102);
    this.name = 'InvariantError';
  }
}

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404, 105);
    this.name = 'InvariantError';
  }
}

module.exports = {
  ClientError,
  TokenError,
  AuthError,
  InvariantError,
  NotFoundError,
};
