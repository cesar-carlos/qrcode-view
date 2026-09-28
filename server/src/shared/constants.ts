export const JSON_BODY_LIMIT = "32kb";
export const UPSTREAM_TIMEOUT_MS = 15_000;
export const SESSION_RATE_LIMIT = 10;
export const SESSION_RATE_WINDOW_MS = 60_000;
export const INSTANCE_TOKEN_COOKIE = "instance_session";
export const INSTANCE_TOKEN_MIN_LENGTH = 8;
export const INSTANCE_TOKEN_MAX_LENGTH = 512;

export const DEFAULT_SUBSCRIBE = ["CONNECTION", "QRCODE"] as const;

export const INSTANCE_EVENTS = [
  "MESSAGE",
  "PRESENCE",
  "CHAT_PRESENCE",
  "CONNECTION",
  "READ_RECEIPT",
  "HISTORY_SYNC",
  "CALL",
  "QRCODE",
  "LABEL",
  "CONTACT",
  "ALL",
] as const;

export type InstanceEvent = (typeof INSTANCE_EVENTS)[number];
