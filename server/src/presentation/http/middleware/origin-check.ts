import type { NextFunction, Request, Response } from "express";
import type { AppConfig } from "../../../shared/config/env.js";
import { AppError } from "../../../shared/errors/app-error.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function createOriginCheck(
  config: Pick<AppConfig, "clientOrigin" | "nodeEnv">,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!unsafeMethods.has(req.method)) {
      next();
      return;
    }

    const origin = req.header("origin");
    if (origin === undefined) {
      if (config.nodeEnv === "production") {
        next(new AppError("unauthorized", "Not authorized", 401));
        return;
      }
      next();
      return;
    }

    if (origin !== config.clientOrigin) {
      next(new AppError("unauthorized", "Not authorized", 401));
      return;
    }
    next();
  };
}
