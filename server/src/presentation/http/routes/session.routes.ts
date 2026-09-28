import { Router } from "express";
import type { EvolutionClient } from "../../../application/ports/evolution-client.js";
import type { AppConfig } from "../../../shared/config/env.js";
import { createSessionController } from "../controllers/session.controller.js";
import { createSessionRateLimit } from "../middleware/rate-limit.js";
import { validateBody } from "../middleware/validate-request.js";
import { openSessionBodySchema } from "../validators/session.validator.js";

export function createSessionRouter(deps: {
  config: Pick<AppConfig, "nodeEnv">;
  evolutionClient: EvolutionClient;
}): Router {
  const router = Router();
  const controller = createSessionController(deps);

  router.post(
    "/",
    createSessionRateLimit(),
    validateBody(openSessionBodySchema),
    controller.open,
  );
  router.delete("/", controller.close);
  return router;
}
