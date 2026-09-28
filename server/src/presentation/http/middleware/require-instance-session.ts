import type { NextFunction, Request, Response } from "express";
import { INSTANCE_TOKEN_COOKIE } from "../../../shared/constants.js";
import { AppError } from "../../../shared/errors/app-error.js";

const tokenByResponse = new WeakMap<Response, string>();

export function requireInstanceSession(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[INSTANCE_TOKEN_COOKIE];
  if (typeof token !== "string" || token.length === 0) {
    next(new AppError("unauthorized", "Not authorized", 401));
    return;
  }
  tokenByResponse.set(res, token);
  next();
}

export function getInstanceToken(res: Response): string {
  const token = tokenByResponse.get(res);
  if (token === undefined) {
    throw new AppError("unauthorized", "Not authorized", 401);
  }
  return token;
}
