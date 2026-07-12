import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  InsufficientBalanceError,
  RateLimitError,
} from "@/lib/errors";

describe("AppError hierarchy", () => {
  it("AppError has correct defaults", () => {
    const err = new AppError("test error");
    expect(err.message).toBe("test error");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
  });

  it("NotFoundError has 404", () => {
    const err = new NotFoundError("user");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("user not found");
  });

  it("UnauthorizedError has 401", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("ForbiddenError has 403", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("ValidationError has 400 and field errors", () => {
    const err = new ValidationError({ email: ["required"] });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.fields).toEqual({ email: ["required"] });
  });

  it("ConflictError has 409", () => {
    const err = new ConflictError("already exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("InsufficientBalanceError has 400", () => {
    const err = new InsufficientBalanceError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("INSUFFICIENT_BALANCE");
  });

  it("RateLimitError has 429", () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
  });

  it("all errors are instances of AppError", () => {
    expect(new NotFoundError()).toBeInstanceOf(AppError);
    expect(new UnauthorizedError()).toBeInstanceOf(AppError);
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
    expect(new ValidationError({})).toBeInstanceOf(AppError);
    expect(new ConflictError()).toBeInstanceOf(AppError);
    expect(new InsufficientBalanceError()).toBeInstanceOf(AppError);
    expect(new RateLimitError()).toBeInstanceOf(AppError);
  });
});
