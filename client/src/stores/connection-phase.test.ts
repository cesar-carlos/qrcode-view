import { describe, expect, it } from "vitest";
import { deriveConnectionPhase } from "./connection-phase";

describe("deriveConnectionPhase", () => {
  it("should stay disconnected before a connection attempt", () => {
    expect(
      deriveConnectionPhase({
        loggedIn: false,
        connected: false,
        pendingAction: null,
      }),
    ).toBe("disconnected");
  });

  it("should wait for the QR code after connect", () => {
    expect(
      deriveConnectionPhase({
        loggedIn: false,
        connected: true,
        pendingAction: "qr",
      }),
    ).toBe("awaiting_qr");
  });

  it("should wait for the pairing code when pairing", () => {
    expect(
      deriveConnectionPhase({
        loggedIn: false,
        connected: false,
        pendingAction: "pair",
      }),
    ).toBe("awaiting_pair");
  });

  it("should report connected when WhatsApp is logged in", () => {
    expect(
      deriveConnectionPhase({
        loggedIn: true,
        connected: true,
        pendingAction: "qr",
      }),
    ).toBe("connected");
  });
});
