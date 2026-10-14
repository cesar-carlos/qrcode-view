import type { QrCode } from "@/api/instance-api";

export function sameQr(current: QrCode | null, next: QrCode): boolean {
  if (current === null) {
    return false;
  }
  if (current.code !== null && next.code !== null) {
    return current.code === next.code;
  }
  return (
    current.imageSrc === next.imageSrc &&
    current.passkeyStage === next.passkeyStage &&
    current.passkeyOpenUrl === next.passkeyOpenUrl &&
    current.passkeyCode === next.passkeyCode
  );
}

function hasPasskey(qr: QrCode): boolean {
  return (
    (qr.passkeyStage !== null && qr.passkeyStage.length > 0) ||
    (qr.passkeyOpenUrl !== null && qr.passkeyOpenUrl.length > 0) ||
    (qr.passkeyCode !== null && qr.passkeyCode.length > 0)
  );
}

export function shouldKeepCurrentQr(
  current: QrCode | null,
  next: QrCode,
): boolean {
  if (current === null) {
    return false;
  }
  // A passkey ceremony replaces the QR. An empty code means Evolution GO cleared it.
  if (hasPasskey(next) || hasPasskey(current)) {
    return sameQr(current, next);
  }
  if (next.imageSrc === null && next.code === null) {
    return false;
  }
  return sameQr(current, next);
}
