// Status only. Do not refetch the QR on this tick.
export const STATUS_POLL_INTERVAL_MS = 3_000;

// Evolution GO keeps the first pairing QR for about 60s, then rotates every 20s.
export const QR_FIRST_LIFETIME_MS = 60_000;
export const QR_LIFETIME_MS = 20_000;
