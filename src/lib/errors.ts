export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>;

  constructor(fields: Record<string, string[]>) {
    super("Validation failed", 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class InsufficientBalanceError extends AppError {
  constructor() {
    super("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    this.name = "InsufficientBalanceError";
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("Too many requests", 429, "RATE_LIMITED");
    this.name = "RateLimitError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
