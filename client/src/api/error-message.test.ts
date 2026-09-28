import { describe, expect, it } from "vitest";
import {
  SESSION_EXPIRED_MESSAGE,
  TOKEN_REJECTED_MESSAGE,
  messageForApiError,
} from "./error-message";
import { ApiError } from "./http";

describe("messageForApiError", () => {
  it("should name a rejected instance token", () => {
    expect(
      messageForApiError(
        new ApiError(401, "unauthorized", "Invalid instance token"),
        "session",
      ),
    ).toBe(TOKEN_REJECTED_MESSAGE);
  });

  it("should name an expired session", () => {
    expect(
      messageForApiError(
        new ApiError(401, "unauthorized", "Not authorized"),
        "status",
      ),
    ).toBe(SESSION_EXPIRED_MESSAGE);
  });

  it("should name the action and the upstream reason", () => {
    expect(
      messageForApiError(
        new ApiError(502, "upstream_error", "Upstream request failed"),
        "qr",
      ),
    ).toBe(
      "Não foi possível atualizar o QR Code. O Evolution GO não concluiu o pedido.",
    );
  });

  it("should explain a network failure for the action in progress", () => {
    expect(messageForApiError(new Error("x"), "connect")).toBe(
      "Não foi possível iniciar a conexão. Sem conexão com o servidor. Verifique a rede e tente de novo.",
    );
  });
});
