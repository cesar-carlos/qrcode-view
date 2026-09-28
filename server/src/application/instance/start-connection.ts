import { DEFAULT_SUBSCRIBE } from "../../shared/constants.js";
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
  const subscribe = input.subscribe ?? DEFAULT_SUBSCRIBE;
  return runEvolution(async () => {
    await client.connect(token, { ...input, subscribe });
    return { started: true };
  });
}
