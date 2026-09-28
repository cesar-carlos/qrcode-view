import { z } from "zod";
import { apiRequest } from "./http";

export const instanceStatusSchema = z.object({
  connected: z.boolean(),
  loggedIn: z.boolean(),
  name: z.string(),
});

export const qrCodeSchema = z.object({
  imageSrc: z.string().nullable(),
  code: z.string().nullable(),
  passkeyStage: z.string().nullable(),
  passkeyOpenUrl: z.string().nullable(),
  passkeyCode: z.string().nullable(),
});

const startedSchema = z.object({ started: z.literal(true) });
const pairingSchema = z.object({ pairingCode: z.string() });
const reconnectedSchema = z.object({ reconnected: z.literal(true) });
const disconnectedSchema = z.object({ disconnected: z.literal(true) });

export type InstanceStatus = z.infer<typeof instanceStatusSchema>;
export type QrCode = z.infer<typeof qrCodeSchema>;

export function getStatus(): Promise<InstanceStatus> {
  return apiRequest(instanceStatusSchema, "/api/v1/instance/status");
}

export function connectInstance(input: {
  phone?: string;
  webhookUrl?: string;
}): Promise<{ started: true }> {
  return apiRequest(startedSchema, "/api/v1/instance/connect", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getQrCode(): Promise<QrCode> {
  return apiRequest(qrCodeSchema, "/api/v1/instance/qr");
}

export function pairInstance(phone: string): Promise<{ pairingCode: string }> {
  return apiRequest(pairingSchema, "/api/v1/instance/pair", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function reconnectInstance(): Promise<{ reconnected: true }> {
  return apiRequest(reconnectedSchema, "/api/v1/instance/reconnect", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function disconnectInstance(): Promise<{ disconnected: true }> {
  return apiRequest(disconnectedSchema, "/api/v1/instance/disconnect", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
