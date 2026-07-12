import { NextResponse } from "next/server";
import { isAppError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: "Validation failed", fields: error.fields },
      { status: 400 }
    );
  }

  if (isAppError(error)) {
    if (error.statusCode >= 500) {
      logger.error({ err: error, code: error.code }, error.message);
    }
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  logger.error({ err: error }, "Unhandled error");
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
