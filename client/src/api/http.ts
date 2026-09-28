import { z } from "zod";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const failureSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export async function apiRequest<T>(
  schema: z.ZodType<T>,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      ...(init?.body === undefined
        ? {}
        : { "content-type": "application/json" }),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return schema.parse(undefined);
  }

  const payload: unknown = await response.json();
  const failure = failureSchema.safeParse(payload);
  if (!response.ok || failure.success) {
    const code = failure.success ? failure.data.error.code : "request_failed";
    const message = failure.success
      ? failure.data.error.message
      : "Request failed";
    throw new ApiError(response.status, code, message);
  }

  const parsed = z
    .object({ success: z.literal(true), data: schema })
    .safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(response.status, "invalid_response", "Invalid response");
  }
  return parsed.data.data;
}
