// Status and QR. The image changes only when the pairing code changes.
export const STATUS_POLL_INTERVAL_MS = 3_000;

// GET /instance/qr returns 400 while Evolution GO is still generating the first code.
export const QR_NOT_READY_QUIET_POLLS = 4;

// Evolution GO keeps the first pairing QR for about 60s, then rotates every 20s.
export const QR_FIRST_LIFETIME_MS = 60_000;
export const QR_LIFETIME_MS = 20_000;

// Pair() issues the phone code against that first QR.
export const PAIRING_CODE_LIFETIME_MS = QR_FIRST_LIFETIME_MS;
