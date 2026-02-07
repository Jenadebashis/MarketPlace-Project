export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Key for distinguishing from DB crashes

    Error.captureStackTrace(this, this.constructor);
  }
}