import type { EvolutionClient } from "../ports/evolution-client.js";
import { runEvolution } from "../run-evolution.js";
import type { Result } from "../../shared/result.js";

export function openSession(
  client: EvolutionClient,
  token: string,
): Promise<Result<{ authenticated: true }>> {
  return runEvolution(async () => {
    await client.getStatus(token);
    return { authenticated: true };
  });
}
