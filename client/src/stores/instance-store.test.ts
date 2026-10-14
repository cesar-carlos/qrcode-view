import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QR_NOT_READY_QUIET_POLLS } from "@/constants";
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
const getQrCodeMock = vi.mocked(getQrCode);

const visibleQr = {
  imageSrc: "data:image/png;base64,abc",
  code: "code-1",
  passkeyStage: null,
  passkeyOpenUrl: null,
  passkeyCode: null,
};

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

  it("should drop an expired QR without calling it valid", async () => {
    getStatusMock.mockResolvedValue({
      connected: true,
      loggedIn: false,
      name: "Loja",
    });
    getQrCodeMock
      .mockResolvedValueOnce(visibleQr)
      .mockRejectedValue(new ApiError(422, "not_ready", "not ready"));
    const store = useInstanceStore();

    await store.refreshStatus();
    expect(await store.refreshQr()).toBe(true);

    expect(await store.refreshQr()).toBe(false);
    expect(store.qr).toBeNull();
    expect(store.errorMessage).toBe("");

    for (
      let attempt = 0;
      attempt < QR_NOT_READY_QUIET_POLLS - 2;
      attempt += 1
    ) {
      await store.refreshQr();
      expect(store.errorMessage).toBe("");
    }

    await store.refreshQr();
    expect(store.errorMessage).toBe(
      "Não foi possível atualizar o QR Code. A instância ainda não está pronta. Espere um instante e tente de novo.",
    );
    expect(store.errorMessage).not.toContain("válido");
  });

  it("should replace the QR when a passkey ceremony starts", async () => {
    getQrCodeMock.mockResolvedValueOnce(visibleQr).mockResolvedValueOnce({
      imageSrc: null,
      code: null,
      passkeyStage: "challenge",
      passkeyOpenUrl: "https://web.whatsapp.com/#wapk=abc",
      passkeyCode: null,
    });
    const store = useInstanceStore();

    await store.refreshQr();
    expect(await store.refreshQr()).toBe(true);
    expect(store.qr?.imageSrc).toBeNull();
    expect(store.qr?.passkeyOpenUrl).toBe("https://web.whatsapp.com/#wapk=abc");
  });

  it("should not request a QR code when WhatsApp is already logged in", async () => {
    getStatusMock.mockResolvedValue({
      connected: true,
      loggedIn: true,
      name: "Loja",
    });
    const store = useInstanceStore();

    await store.refreshStatus();
    expect(await store.refreshQr()).toBe(false);
    expect(getQrCodeMock).not.toHaveBeenCalled();
  });
});
