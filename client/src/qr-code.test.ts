import { describe, expect, it } from "vitest";
import type { QrCode } from "@/api/instance-api";
import { shouldKeepCurrentQr, sameQr } from "./qr-code";

const qr = (overrides: Partial<QrCode> = {}): QrCode => ({
  imageSrc: "data:image/png;base64,abc",
  code: "code-1",
  passkeyStage: null,
  passkeyOpenUrl: null,
  passkeyCode: null,
  ...overrides,
});

describe("sameQr", () => {
  it("should treat a first payload as a change", () => {
    expect(sameQr(null, qr())).toBe(false);
  });

  it("should ignore a refetch of the same pairing code", () => {
    expect(sameQr(qr(), qr({ imageSrc: "data:image/png;base64,other" }))).toBe(
      true,
    );
  });
});

describe("shouldKeepCurrentQr", () => {
  it("should keep the visible QR when the next payload has no image", () => {
    expect(shouldKeepCurrentQr(qr(), qr({ imageSrc: null, code: null }))).toBe(
      true,
    );
  });
});
