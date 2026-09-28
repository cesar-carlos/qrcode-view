import { Router } from "express";
import type { EvolutionClient } from "../../../application/ports/evolution-client.js";
import type { AppConfig } from "../../../shared/config/env.js";
import { createInstanceRouter } from "./instance.routes.js";
import { createSessionRouter } from "./session.routes.js";

export function createHttpRouter(deps: {
  config: Pick<AppConfig, "nodeEnv">;
  evolutionClient: EvolutionClient;
}): Router {
  const router = Router();
  router.use("/session", createSessionRouter(deps));
  router.use("/instance", createInstanceRouter(deps));
  return router;
}
