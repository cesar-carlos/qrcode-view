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
    current.passkeyCode === next.passkeyCode
  );
}

export function shouldKeepCurrentQr(
  current: QrCode | null,
  next: QrCode,
): boolean {
  if (next.imageSrc === null && current?.imageSrc) {
    return true;
  }
  return sameQr(current, next);
}
