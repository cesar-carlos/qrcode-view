import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import TokenView from "./TokenView.vue";

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
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "token", component: TokenView },
        {
          path: "/conectar",
          name: "connection",
          component: defineComponent({ template: "<div />" }),
        },
      ],
    });
    await router.push("/");
    const wrapper = mount(TokenView, {
      global: { plugins: [router] },
    });

    const input = wrapper.get("[data-testid='instance-token']");
    await input.setValue("instance-token-123");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect((input.element as HTMLInputElement).value).toBe("");
  });
});
