import { describe, expect, it } from "vitest";
import { readInstanceTokenLink } from "./instance-token-link";

const token = "e69e464b-bcb5-446a-a22c-1f39dc7a5e1d";

describe("readInstanceTokenLink", () => {
  it("should read the token from the path used in a client link", () => {
    expect(readInstanceTokenLink({ params: { token }, query: {} })).toBe(token);
  });

  it("should read the token from the token query", () => {
    expect(
      readInstanceTokenLink({ params: {}, query: { token } }),
    ).toBe(token);
  });

  it("should ignore a token that is too short to be an instance token", () => {
    expect(
      readInstanceTokenLink({ params: { token: "short" }, query: {} }),
    ).toBeNull();
  });
});
