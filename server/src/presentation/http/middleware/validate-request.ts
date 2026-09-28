import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../../../shared/errors/app-error.js";

const bodies = new WeakMap<Response, unknown>();

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body ?? {});
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      next(new AppError("validation_error", "Invalid request", 422, details));
      return;
    }
    bodies.set(res, parsed.data);
    next();
  };
}

export function getValidatedBody<T>(res: Response): T {
  if (!bodies.has(res)) {
    throw new AppError("validation_error", "Invalid request", 422);
  }
  return bodies.get(res) as T;
}
