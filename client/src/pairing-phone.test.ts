import { describe, expect, it } from "vitest";
import { PAIRING_PHONE_MESSAGE, pairingPhoneError } from "./pairing-phone";

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
});
