import type {
  ConnectInput,
  EvolutionClient,
} from "../ports/evolution-client.js";
import { runEvolution } from "../run-evolution.js";
import type { Result } from "../../shared/result.js";

export function startConnection(
  client: EvolutionClient,
  token: string,
  input: ConnectInput,
): Promise<Result<{ started: true }>> {
  return runEvolution(async () => {
    await client.connect(token, input);
    return { started: true };
  });
}
