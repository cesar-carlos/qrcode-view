// Status and QR. The image changes only when the pairing code changes.
export const STATUS_POLL_INTERVAL_MS = 3_000;

// GET /instance/qr is empty while Evolution GO is still generating the first code.
export const QR_UNAVAILABLE_QUIET_POLLS = 2;

// connect() can return before the WhatsApp socket is up. Retry a few times.
export const CONNECT_RETRY_AFTER_MS = 25_000;
export const CONNECT_RETRY_MAX = 2;

// Evolution GO keeps the first pairing QR for about 60s, then rotates every 20s.
export const QR_FIRST_LIFETIME_MS = 60_000;
export const QR_LIFETIME_MS = 20_000;

// Pair() issues the phone code against that first QR.
export const PAIRING_CODE_LIFETIME_MS = QR_FIRST_LIFETIME_MS;
