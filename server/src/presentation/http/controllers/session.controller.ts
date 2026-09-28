import type { CookieOptions, Request, Response } from "express";
import type { EvolutionClient } from "../../../application/ports/evolution-client.js";
import { openSession } from "../../../application/session/open-session.js";
import type { AppConfig } from "../../../shared/config/env.js";
import { INSTANCE_TOKEN_COOKIE } from "../../../shared/constants.js";
import { asyncHandler, failureToError } from "../http.js";
import { getValidatedBody } from "../middleware/validate-request.js";
import type { OpenSessionBody } from "../validators/session.validator.js";

export function createSessionController(deps: {
  config: Pick<AppConfig, "nodeEnv">;
  evolutionClient: EvolutionClient;
}) {
  return {
    open: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
      const body = getValidatedBody<OpenSessionBody>(res);
      const result = await openSession(deps.evolutionClient, body.token);
      if (!result.success) {
        throw failureToError(result.error);
      }

      res.cookie(
        INSTANCE_TOKEN_COOKIE,
        body.token,
        cookieOptions(deps.config.nodeEnv),
      );
      res.status(200).json({ success: true, data: { authenticated: true } });
    }),
    close: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
      res.clearCookie(
        INSTANCE_TOKEN_COOKIE,
        cookieOptions(deps.config.nodeEnv),
      );
      res.status(204).send();
    }),
  };
}

function cookieOptions(nodeEnv: AppConfig["nodeEnv"]): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnv === "production",
    path: "/",
  };
}
