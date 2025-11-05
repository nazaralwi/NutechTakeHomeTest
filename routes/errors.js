class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);

    if (this.constructor.name === 'ClientError') {
      throw new Error('cannot instantiate abstract class');
    }

    this.statusCode = statusCode;
    this.name = 'ClientError';
  }
}

class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthorizationError';
  }
}

module.exports = { ClientError, AuthorizationError };