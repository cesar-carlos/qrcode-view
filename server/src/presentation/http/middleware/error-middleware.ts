import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error.js";
import { logError } from "../../../shared/logger.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }

  if (isJsonParseError(error)) {
    res.status(400).json({
      success: false,
      error: { code: "validation_error", message: "Invalid request" },
    });
    return;
  }

  logError("Unhandled request error", error);
  res.status(500).json({
    success: false,
    error: { code: "internal_error", message: "Internal error" },
  });
}

function isJsonParseError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}
