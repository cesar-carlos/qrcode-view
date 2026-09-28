import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http";
import {
  connectInstance,
  disconnectInstance,
  getQrCode,
  getStatus,
  pairInstance,
  reconnectInstance,
} from "@/api/instance-api";
import { useInstanceStore } from "@/stores/instance-store";
import { useSessionStore } from "@/stores/session-store";

vi.mock("@/api/instance-api", () => ({
  connectInstance: vi.fn(),
  disconnectInstance: vi.fn(),
  getQrCode: vi.fn(),
  getStatus: vi.fn(),
  pairInstance: vi.fn(),
  reconnectInstance: vi.fn(),
}));

const connectInstanceMock = vi.mocked(connectInstance);
const getStatusMock = vi.mocked(getStatus);

describe("useInstanceStore errors", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    connectInstanceMock.mockReset();
    getStatusMock.mockReset();
    vi.mocked(getQrCode).mockReset();
    vi.mocked(pairInstance).mockReset();
    vi.mocked(reconnectInstance).mockReset();
    vi.mocked(disconnectInstance).mockReset();
  });

  it("should keep a connection error when a later status poll fails", async () => {
    connectInstanceMock.mockRejectedValue(
      new ApiError(502, "upstream_error", "Upstream request failed"),
    );
    getStatusMock.mockRejectedValue(
      new ApiError(503, "upstream_unavailable", "Evolution GO is unavailable"),
    );
    const store = useInstanceStore();

    await store.connect();
    expect(store.errorMessage).toBe(
      "Não foi possível iniciar a conexão. O Evolution GO não concluiu o pedido.",
    );

    await store.refreshStatus();
    expect(store.errorMessage).toBe(
      "Não foi possível iniciar a conexão. O Evolution GO não concluiu o pedido.",
    );
  });

  it("should explain a missing session before leaving the connection screen", async () => {
    getStatusMock.mockRejectedValue(
      new ApiError(401, "unauthorized", "Not authorized"),
    );
    const store = useInstanceStore();

    await store.refreshStatus();

    expect(store.errorMessage).toBe("");
    expect(useSessionStore().notice).toBe(
      "Sessão expirada. Informe o token de novo.",
    );
    expect(useSessionStore().authenticated).toBe(false);
  });
});
