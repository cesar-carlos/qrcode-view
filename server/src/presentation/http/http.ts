import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error.js";
import type { AppFailure } from "../../shared/result.js";

const statusByCode = {
  unauthorized: 401,
  validation_error: 422,
  not_ready: 422,
  upstream_error: 502,
  upstream_unavailable: 503,
  not_found: 404,
  rate_limited: 429,
  internal_error: 500,
} as const;

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}

export function failureToError(failure: AppFailure): AppError {
  return new AppError(
    failure.code,
    failure.message,
    statusByCode[failure.code],
  );
}
