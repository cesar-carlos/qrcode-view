import "dotenv/config";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createEvolutionClient } from "./infrastructure/evolution/evolution-http-client.js";
import { loadConfig } from "./shared/config/env.js";
import { logInfo } from "./shared/logger.js";

const clientDist = fileURLToPath(new URL("../../client/dist", import.meta.url));
const config = loadConfig(
  process.env,
  existsSync(clientDist) ? clientDist : null,
);
const app = createApp({
  config,
  evolutionClient: createEvolutionClient(config),
});

app.listen(config.port, () => {
  logInfo("Server listening", { port: config.port });
});
