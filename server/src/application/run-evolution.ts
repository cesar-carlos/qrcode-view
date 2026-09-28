import type { AppErrorCode } from "../shared/errors/app-error.js";
import type { Result } from "../shared/result.js";
import { EvolutionRequestError } from "./evolution-request-error.js";

const messageByKind = {
  unauthorized: "Invalid instance token",
  not_ready: "The instance is not ready for that action yet",
  upstream: "Upstream request failed",
  unavailable: "Evolution GO is unavailable",
} as const;

const codeByKind = {
  unauthorized: "unauthorized",
  not_ready: "not_ready",
  upstream: "upstream_error",
  unavailable: "upstream_unavailable",
} as const satisfies Record<EvolutionRequestError["kind"], AppErrorCode>;

export function mapEvolutionError(error: unknown): {
  code: AppErrorCode;
  message: string;
} {
  if (error instanceof EvolutionRequestError) {
    return { code: codeByKind[error.kind], message: messageByKind[error.kind] };
  }
  return { code: "upstream_unavailable", message: messageByKind.unavailable };
}

export async function runEvolution<T>(
  action: () => Promise<T>,
): Promise<Result<T>> {
  try {
    return { success: true, data: await action() };
  } catch (error: unknown) {
    return { success: false, error: mapEvolutionError(error) };
  }
}
