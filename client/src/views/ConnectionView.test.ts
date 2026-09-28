import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { ApiError } from "@/api/http";
import { getQrCode, getStatus, connectInstance } from "@/api/instance-api";
import { useSessionStore } from "@/stores/session-store";
import ConnectionView from "./ConnectionView.vue";
import TokenView from "./TokenView.vue";

vi.mock("@/api/session-api", () => ({
  openSession: vi.fn(async () => ({ authenticated: true })),
  closeSession: vi.fn(async () => undefined),
}));

vi.mock("@/api/instance-api", () => ({
  getStatus: vi.fn(),
  connectInstance: vi.fn(async () => ({ started: true })),
  getQrCode: vi.fn(async () => ({
    imageSrc: "data:image/png;base64,abc",
    code: null,
    passkeyStage: null,
    passkeyOpenUrl: null,
    passkeyCode: null,
  })),
  pairInstance: vi.fn(),
  reconnectInstance: vi.fn(),
  disconnectInstance: vi.fn(),
}));

const getStatusMock = vi.mocked(getStatus);
const connectInstanceMock = vi.mocked(connectInstance);
const getQrCodeMock = vi.mocked(getQrCode);

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

async function mountConnection() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const session = useSessionStore();
  session.checked = true;
  session.authenticated = true;
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "token", component: TokenView },
      {
        path: "/conectar",
        name: "connection",
        component: ConnectionView,
      },
    ],
  });
  await router.push("/conectar");
  await router.isReady();
  return mount(ConnectionView, {
    global: { plugins: [pinia, router] },
  });
}

describe("ConnectionView", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    getStatusMock.mockReset();
    connectInstanceMock.mockClear();
    getQrCodeMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show a success card when WhatsApp is logged in", async () => {
    getStatusMock.mockResolvedValue({
      connected: true,
      loggedIn: true,
      name: "Loja Centro",
    });
    const wrapper = await mountConnection();
    await flushPromises();

    expect(wrapper.get("[data-testid='success-panel']").text()).toContain(
      "WhatsApp conectado",
    );
    expect(wrapper.get("[data-testid='success-panel']").text()).toContain(
      "Pode fechar esta página",
    );
    expect(wrapper.get("[data-testid='disconnect']").text()).toContain(
      "Desconectar WhatsApp",
    );
    expect(wrapper.get("[data-testid='leave-session']").text()).toBe(
      "Usar outra instância",
    );
    expect(wrapper.text()).not.toContain("Sair desta tela");
    expect(connectInstanceMock).not.toHaveBeenCalled();
  });

  it("should show a skeleton while the first status request is in flight", async () => {
    getStatusMock.mockReturnValue(new Promise(() => undefined));
    const wrapper = await mountConnection();
    expect(wrapper.find("[data-testid='status-skeleton']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='success-panel']").exists()).toBe(false);
  });

  it("should start the QR connection on desktop when the instance is disconnected", async () => {
    getStatusMock.mockResolvedValue({
      connected: false,
      loggedIn: false,
      name: "Loja Centro",
    });
    const wrapper = await mountConnection();
    await flushPromises();

    expect(connectInstanceMock).toHaveBeenCalledOnce();
    expect(getQrCodeMock).toHaveBeenCalled();
    expect(wrapper.get("[data-testid='other-methods']").text()).toContain(
      "Outras formas de conectar",
    );
    expect(wrapper.get("[data-testid='qr-countdown']").text()).toBe(
      "Atualiza em 60s",
    );
  });

  it("should keep the displayed QR while status is polled", async () => {
    vi.useFakeTimers();
    getStatusMock.mockResolvedValue({
      connected: false,
      loggedIn: false,
      name: "Loja Centro",
    });
    const wrapper = await mountConnection();
    await flushPromises();
    const qrFetches = getQrCodeMock.mock.calls.length;

    await vi.advanceTimersByTimeAsync(9_000);
    await flushPromises();

    expect(getQrCodeMock.mock.calls.length).toBe(qrFetches);
    expect(getStatusMock.mock.calls.length).toBeGreaterThan(1);
    expect(wrapper.get("[data-testid='qr-countdown']").text()).toMatch(
      /Atualiza em 5\ds/,
    );
  });

  it("should keep the QR panel while the socket is up and WhatsApp is not logged in", async () => {
    getStatusMock.mockResolvedValue({
      connected: true,
      loggedIn: false,
      name: "Loja Centro",
    });
    const wrapper = await mountConnection();
    await flushPromises();

    expect(connectInstanceMock).not.toHaveBeenCalled();
    expect(getQrCodeMock).toHaveBeenCalled();
    expect(wrapper.get("[data-testid='qr-countdown']").text()).toBe(
      "Atualiza em 60s",
    );
    expect(wrapper.find("[data-testid='success-panel']").exists()).toBe(false);
  });

  it("should explain why the instance status could not be loaded", async () => {
    getStatusMock.mockRejectedValue(
      new ApiError(503, "upstream_unavailable", "Evolution GO is unavailable"),
    );
    const wrapper = await mountConnection();
    await flushPromises();

    const alerts = wrapper.findAll("[role='alert']");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.text()).toBe(
      "Não foi possível consultar esta instância. O Evolution GO está indisponível. Tente de novo em instantes.",
    );
    expect(wrapper.text()).toContain("Tentar de novo");
  });

  it("should put pairing first on a narrow viewport", async () => {
    mockMatchMedia(true);
    getStatusMock.mockResolvedValue({
      connected: false,
      loggedIn: false,
      name: "Loja Centro",
    });
    const wrapper = await mountConnection();
    await flushPromises();

    expect(connectInstanceMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Parear com número de telefone");
    expect(wrapper.find("#pair-phone").exists()).toBe(true);
  });
});
