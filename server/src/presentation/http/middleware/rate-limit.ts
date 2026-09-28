import type { NextFunction, Request, Response } from "express";
import {
  SESSION_RATE_LIMIT,
  SESSION_RATE_WINDOW_MS,
} from "../../../shared/constants.js";
import { AppError } from "../../../shared/errors/app-error.js";

export function createSessionRateLimit(now: () => number = Date.now) {
  const hits = new Map<string, number[]>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip ?? "unknown";
    const current = now();
    const recent = (hits.get(key) ?? []).filter(
      (timestamp) => current - timestamp < SESSION_RATE_WINDOW_MS,
    );
    if (recent.length >= SESSION_RATE_LIMIT) {
      next(new AppError("rate_limited", "Too many attempts", 429));
      return;
    }
    recent.push(current);
    hits.set(key, recent);
    next();
  };
}
