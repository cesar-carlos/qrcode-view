export const JSON_BODY_LIMIT = "32kb";
export const UPSTREAM_TIMEOUT_MS = 15_000;
// GET /instance/qr can wait while whatsmeow issues the first pairing code.
export const QR_UPSTREAM_TIMEOUT_MS = 45_000;
export const SESSION_RATE_LIMIT = 10;
export const SESSION_RATE_WINDOW_MS = 60_000;
export const INSTANCE_TOKEN_COOKIE = "instance_session";
export const INSTANCE_TOKEN_MIN_LENGTH = 8;
export const INSTANCE_TOKEN_MAX_LENGTH = 512;
