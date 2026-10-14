export type EvolutionFailureKind =
  "unauthorized" | "not_ready" | "upstream" | "unavailable" | "not_found";

export class EvolutionRequestError extends Error {
  readonly kind: EvolutionFailureKind;

  constructor(kind: EvolutionFailureKind, message: string) {
    super(message);
    this.name = "EvolutionRequestError";
    this.kind = kind;
  }
}
