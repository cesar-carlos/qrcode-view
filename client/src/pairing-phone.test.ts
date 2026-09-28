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

  it("should reject a number that has no country code and is still incomplete", () => {
    expect(pairingPhoneError("819999")).toBe(PAIRING_PHONE_MESSAGE);
    expect(pairingPhoneError("819999999999")).toBe(PAIRING_PHONE_MESSAGE);
  });
});

describe("normalizePairingPhone", () => {
  it("should prefix the Brazil country code on a full national number", () => {
    expect(normalizePairingPhone("81999999999")).toBe("5581999999999");
    expect(normalizePairingPhone("(81) 9999-9999")).toBe("558199999999");
  });

  it("should keep a number that already includes the country code", () => {
    expect(normalizePairingPhone("+55 (81) 99999-9999")).toBe("5581999999999");
  });
});

describe("formatPairingPhone", () => {
  it("should format a Brazilian mobile number with country code", () => {
    expect(formatPairingPhone("5581999999999")).toBe("+55 (81) 99999-9999");
  });

  it("should show the country code on a full national number", () => {
    expect(formatPairingPhone("81999999999")).toBe("+55 (81) 99999-9999");
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
