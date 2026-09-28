import type { AppErrorCode } from "./errors/app-error.js";

export interface AppFailure {
  readonly code: AppErrorCode;
  readonly message: string;
}

export type Result<T> =
  { success: true; data: T } | { success: false; error: AppFailure };
