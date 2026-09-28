import type { EvolutionClient } from "../ports/evolution-client.js";
import { runEvolution } from "../run-evolution.js";
import type { Result } from "../../shared/result.js";

export function reconnectInstance(
  client: EvolutionClient,
  token: string,
): Promise<Result<{ reconnected: true }>> {
  return runEvolution(async () => {
    await client.reconnect(token);
    return { reconnected: true };
  });
}
