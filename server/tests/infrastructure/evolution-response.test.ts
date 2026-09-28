import { describe, expect, it } from "vitest";
import {
  parseInstanceStatus,
  parsePairingCode,
  parseQrCode,
  toQrImageSrc,
} from "../../src/infrastructure/evolution/evolution-response.js";

describe("evolution response parser", () => {
  it("should read PascalCase status fields from Evolution GO", () => {
    expect(
      parseInstanceStatus({
        message: "success",
        data: { Connected: true, LoggedIn: false, Name: "Loja" },
      }),
    ).toEqual({ connected: true, loggedIn: false, name: "Loja" });
  });

  it("should turn a long base64 qr payload into an image source", () => {
    const qrcode = "A".repeat(120);
    expect(toQrImageSrc(qrcode)).toBe(`data:image/png;base64,${qrcode}`);
    expect(parseQrCode({ data: { qrcode, code: "raw-code" } }).code).toBe(
      "raw-code",
    );
  });

  it("should read PairingCode", () => {
    expect(parsePairingCode({ data: { PairingCode: "WXYZ-9999" } })).toEqual({
      pairingCode: "WXYZ-9999",
    });
  });
});
