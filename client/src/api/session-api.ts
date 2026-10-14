import { z } from "zod";
import { apiRequest } from "./http";

const sessionSchema = z.object({
  authenticated: z.literal(true),
});

export function getSession(): Promise<{ authenticated: true } | undefined> {
  return apiRequest(sessionSchema.optional(), "/api/v1/session");
}

export function openSession(token: string): Promise<{ authenticated: true }> {
  return apiRequest(sessionSchema, "/api/v1/session", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function closeSession(): Promise<void> {
  return apiRequest(z.undefined(), "/api/v1/session", { method: "DELETE" });
}
