import { z } from "zod";
import { EvolutionRequestError } from "../../application/evolution-request-error.js";
import type {
  InstanceStatus,
  PairingResult,
  QrCode,
} from "../../application/ports/evolution-client.js";

const statusSchema = z.object({
  data: z.object({
    Connected: z.boolean().optional(),
    LoggedIn: z.boolean().optional(),
    Name: z.string().optional(),
    connected: z.boolean().optional(),
    loggedIn: z.boolean().optional(),
    name: z.string().optional(),
  }),
});

const qrSchema = z.object({
  data: z.object({
    qrcode: z.string().optional(),
    code: z.string().optional(),
    passkeyStage: z.string().optional(),
    passkeyOpenUrl: z.string().optional(),
    passkeyCode: z.string().optional(),
  }),
});

const pairSchema = z.object({
  data: z.object({
    PairingCode: z.string().optional(),
    pairingCode: z.string().optional(),
  }),
});

function readFlag(
  pascal: boolean | undefined,
  camel: boolean | undefined,
): boolean {
  if (typeof pascal === "boolean") {
    return pascal;
  }
  if (typeof camel === "boolean") {
    return camel;
  }
  throw new EvolutionRequestError("upstream", "Upstream request failed");
}

export function parseInstanceStatus(payload: unknown): InstanceStatus {
  const parsed = statusSchema.safeParse(payload);
  if (!parsed.success) {
    throw new EvolutionRequestError("upstream", "Upstream request failed");
  }
  const data = parsed.data.data;
  return {
    connected: readFlag(data.Connected, data.connected),
    loggedIn: readFlag(data.LoggedIn, data.loggedIn),
    name: data.Name ?? data.name ?? "",
  };
}

export function toQrImageSrc(qrcode: string): string | null {
  if (qrcode.length === 0) {
    return null;
  }
  if (
    qrcode.startsWith("data:image/") ||
    qrcode.startsWith("https://") ||
    qrcode.startsWith("http://")
  ) {
    return qrcode;
  }
  if (qrcode.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(qrcode)) {
    return `data:image/png;base64,${qrcode.replace(/\s/g, "")}`;
  }
  return null;
}

export function parseQrCode(payload: unknown): QrCode {
  const parsed = qrSchema.safeParse(payload);
  if (!parsed.success) {
    throw new EvolutionRequestError("upstream", "Upstream request failed");
  }
  const data = parsed.data.data;
  const qrcode = data.qrcode ?? "";
  return {
    imageSrc: toQrImageSrc(qrcode),
    code: data.code && data.code.length > 0 ? data.code : null,
    passkeyStage: data.passkeyStage ?? null,
    passkeyOpenUrl: data.passkeyOpenUrl ?? null,
    passkeyCode: data.passkeyCode ?? null,
  };
}

export function parsePairingCode(payload: unknown): PairingResult {
  const parsed = pairSchema.safeParse(payload);
  if (!parsed.success) {
    throw new EvolutionRequestError("upstream", "Upstream request failed");
  }
  const pairingCode =
    parsed.data.data.PairingCode ?? parsed.data.data.pairingCode ?? "";
  if (pairingCode.length === 0) {
    throw new EvolutionRequestError("upstream", "Upstream request failed");
  }
  return { pairingCode };
}
