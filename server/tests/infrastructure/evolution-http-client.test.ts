import { describe, expect, it } from "vitest";
import {
  classifyUpstreamStatus,
  shouldLogUpstreamFailure,
  toConnectPayload,
} from "../../src/infrastructure/evolution/evolution-http-client.js";

describe("connect payload", () => {
  it("should send only the immediate flag", () => {
    expect(toConnectPayload({})).toEqual({ immediate: true });
  });

  it("should include a phone when the caller set one", () => {
    expect(toConnectPayload({ phone: "5581999999999" })).toEqual({
      immediate: true,
      phone: "5581999999999",
    });
  });
});

describe("upstream status", () => {
  it("should treat a missing QR as not ready", () => {
    expect(classifyUpstreamStatus("/instance/qr", 400)).toBe("not_ready");
    expect(classifyUpstreamStatus("/instance/qr", 422)).toBe("not_ready");
    expect(classifyUpstreamStatus("/instance/qr", 404)).toBe("not_ready");
  });

  it("should keep other client errors as upstream failures", () => {
    expect(classifyUpstreamStatus("/instance/connect", 400)).toBe("upstream");
    expect(classifyUpstreamStatus("/instance/status", 500)).toBe("upstream");
  });

  it("should recognize a missing instance and a rejected token", () => {
    expect(classifyUpstreamStatus("/instance/status", 404)).toBe("not_found");
    expect(classifyUpstreamStatus("/instance/status", 401)).toBe(
      "unauthorized",
    );
    expect(classifyUpstreamStatus("/instance/status", 200)).toBeNull();
  });

  it("should not log a missing QR as an upstream failure", () => {
    expect(shouldLogUpstreamFailure("not_ready")).toBe(false);
    expect(shouldLogUpstreamFailure("unavailable")).toBe(true);
    expect(shouldLogUpstreamFailure("upstream")).toBe(true);
  });
});
