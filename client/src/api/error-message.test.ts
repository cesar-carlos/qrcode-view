import { describe, expect, it } from "vitest";
import { messageForApiError } from "./error-message";
import { ApiError } from "./http";

describe("messageForApiError", () => {
  it("should translate an unknown instance token", () => {
    expect(
      messageForApiError(
        new ApiError(401, "unauthorized", "Invalid instance token"),
        "falha",
      ),
    ).toBe("Token não encontrado");
  });

  it("should translate an expired session", () => {
    expect(
      messageForApiError(
        new ApiError(401, "unauthorized", "Not authorized"),
        "falha",
      ),
    ).toBe("Sessão expirada. Informe o token de novo.");
  });

  it("should keep the fallback for an unknown error", () => {
    expect(messageForApiError(new Error("x"), "falha")).toBe("falha");
  });
});
