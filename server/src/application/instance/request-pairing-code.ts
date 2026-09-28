import type {
  EvolutionClient,
  PairingResult,
  PairInput,
} from "../ports/evolution-client.js";
import { runEvolution } from "../run-evolution.js";
import type { Result } from "../../shared/result.js";

export function requestPairingCode(
  client: EvolutionClient,
  token: string,
  input: PairInput,
): Promise<Result<PairingResult>> {
  return runEvolution(() => client.pair(token, input));
}
