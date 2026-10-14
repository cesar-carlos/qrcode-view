import { describe, expect, it } from "vitest";
import {
  PAIRING_PHONE_MESSAGE,
  formatPairingCode,
  formatPairingPhone,
  normalizePairingPhone,
  pairingPhoneDigits,
  pairingPhoneError,
} from "./pairing-phone";

describe("pairingPhoneError", () => {
  it("should stay quiet while the field is empty", () => {
    expect(pairingPhoneError("")).toBeNull();
  });

  it("should ask for the country and area code when the number is short", () => {
    expect(pairingPhoneError("9999")).toBe(PAIRING_PHONE_MESSAGE);
  });

  it("should accept digits with country and area code", () => {
    expect(pairingPhoneError("5581999999999")).toBeNull();
    expect(pairingPhoneError("+55 (81) 99999-9999")).toBeNull();
  });

  it("should reject a number that is still incomplete", () => {
    expect(pairingPhoneError("819999")).toBe(PAIRING_PHONE_MESSAGE);
  });

  it("should accept a number that already includes another country code", () => {
    expect(pairingPhoneError("+351 912 345 678")).toBeNull();
  });
});

describe("normalizePairingPhone", () => {
  it("should prefix the Brazil country code on a full national number", () => {
    expect(normalizePairingPhone("81999999999")).toBe("5581999999999");
    expect(normalizePairingPhone("(81) 9999-9999")).toBe("558199999999");
  });

  it("should keep a number that already includes the country code", () => {
    expect(normalizePairingPhone("+55 (81) 99999-9999")).toBe("5581999999999");
    expect(normalizePairingPhone("+351 912 345 678")).toBe("351912345678");
  });
});

describe("formatPairingPhone", () => {
  it("should format a Brazilian mobile number with country code", () => {
    expect(formatPairingPhone("5581999999999")).toBe("+55 (81) 99999-9999");
  });

  it("should show the country code on a full national number", () => {
    expect(formatPairingPhone("81999999999")).toBe("+55 (81) 99999-9999");
  });

  it("should show a non-Brazilian number with its country code", () => {
    expect(formatPairingPhone("351912345678")).toBe("+351912345678");
  });

  it("should keep only digits up to the maximum length", () => {
    expect(pairingPhoneDigits("+55 (81) 99999-9999 extra")).toBe(
      "5581999999999",
    );
  });
});

describe("formatPairingCode", () => {
  it("should group pairing codes in blocks of four", () => {
    expect(formatPairingCode("ABCD1234")).toBe("ABCD-1234");
  });
});
