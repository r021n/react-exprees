export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errorCode?: string,
    isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode ?? "";
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}
