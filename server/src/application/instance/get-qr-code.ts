import type { EvolutionClient, QrCode } from "../ports/evolution-client.js";
import { runEvolution } from "../run-evolution.js";
import type { Result } from "../../shared/result.js";

export function getQrCode(
  client: EvolutionClient,
  token: string,
): Promise<Result<QrCode>> {
  return runEvolution(() => client.getQr(token));
}
