import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { useSessionStore } from "@/stores/session-store";
import TokenView from "./TokenView.vue";

const connectionStub = defineComponent({ template: "<div />" });

async function mountTokenView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "token", component: TokenView },
      {
        path: "/conectar",
        name: "connection",
        component: connectionStub,
      },
    ],
  });
  await router.push("/");
  return mount(TokenView, {
    global: { plugins: [router] },
  });
}

vi.mock("@/api/session-api", () => ({
  openSession: vi.fn(async () => ({ authenticated: true })),
}));

vi.mock("@/api/instance-api", () => ({
  getStatus: vi.fn(async () => {
    throw new Error("unauthorized");
  }),
}));

describe("TokenView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should clear the token field after a successful session", async () => {
    const wrapper = await mountTokenView();

    const input = wrapper.get("[data-testid='instance-token']");
    await input.setValue("instance-token-123");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("should show why the previous session ended", async () => {
    useSessionStore().markSignedOut(
      "Sessão expirada. Informe o token de novo.",
    );
    const wrapper = await mountTokenView();
    await flushPromises();

    expect(wrapper.get("[role='alert']").text()).toBe(
      "Sessão expirada. Informe o token de novo.",
    );
  });

  it("should paste the token from the clipboard", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: vi.fn(async () => "  pasted-instance-token  "),
      },
    });
    const wrapper = await mountTokenView();
    await flushPromises();

    await wrapper.get("[data-testid='paste-token']").trigger("click");
    await flushPromises();

    const input = wrapper.get("[data-testid='instance-token']");
    expect((input.element as HTMLInputElement).value).toBe(
      "pasted-instance-token",
    );
  });
});
