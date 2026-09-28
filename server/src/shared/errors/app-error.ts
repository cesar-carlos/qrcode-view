export type AppErrorCode =
  | "unauthorized"
  | "validation_error"
  | "not_ready"
  | "upstream_error"
  | "upstream_unavailable"
  | "not_found"
  | "rate_limited"
  | "internal_error";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: readonly { path: string; message: string }[];

  constructor(
    code: AppErrorCode,
    message: string,
    status: number,
    details?: readonly { path: string; message: string }[],
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
