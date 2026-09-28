import { Router } from "express";
import type { EvolutionClient } from "../../../application/ports/evolution-client.js";
import { createInstanceController } from "../controllers/instance.controller.js";
import { requireInstanceSession } from "../middleware/require-instance-session.js";
import { validateBody } from "../middleware/validate-request.js";
import {
  connectBodySchema,
  pairBodySchema,
} from "../validators/instance.validator.js";

export function createInstanceRouter(deps: {
  evolutionClient: EvolutionClient;
}): Router {
  const router = Router();
  const controller = createInstanceController(deps);

  router.use(requireInstanceSession);
  router.get("/status", controller.status);
  router.post("/connect", validateBody(connectBodySchema), controller.connect);
  router.get("/qr", controller.qr);
  router.post("/pair", validateBody(pairBodySchema), controller.pair);
  router.post("/reconnect", controller.reconnect);
  router.post("/disconnect", controller.disconnect);
  return router;
}
