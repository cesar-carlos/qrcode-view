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
  it("should drop the QR when the server clears the code", () => {
    expect(shouldKeepCurrentQr(qr(), qr({ imageSrc: null, code: null }))).toBe(
      false,
    );
  });

  it("should keep the image when the pairing code is unchanged", () => {
    expect(shouldKeepCurrentQr(qr(), qr({ imageSrc: null }))).toBe(true);
  });

  it("should replace the QR when a passkey ceremony starts", () => {
    expect(
      shouldKeepCurrentQr(
        qr(),
        qr({
          imageSrc: null,
          code: null,
          passkeyStage: "challenge",
          passkeyOpenUrl: "https://web.whatsapp.com/#wapk=abc",
        }),
      ),
    ).toBe(false);
  });
});
