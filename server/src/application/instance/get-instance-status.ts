import type { EvolutionClient } from "../ports/evolution-client.js";
import type { InstanceStatus } from "../ports/evolution-client.js";
import { runEvolution } from "../run-evolution.js";
import type { Result } from "../../shared/result.js";

export function getInstanceStatus(
  client: EvolutionClient,
  token: string,
): Promise<Result<InstanceStatus>> {
  return runEvolution(() => client.getStatus(token));
}
