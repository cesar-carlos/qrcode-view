import type { EvolutionClient } from "../ports/evolution-client.js";
import { runEvolution } from "../run-evolution.js";
import type { Result } from "../../shared/result.js";

export function disconnectInstance(
  client: EvolutionClient,
  token: string,
): Promise<Result<{ disconnected: true }>> {
  return runEvolution(async () => {
    await client.disconnect(token);
    return { disconnected: true };
  });
}
