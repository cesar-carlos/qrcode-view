import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http";
import { getSession } from "@/api/session-api";
import { useSessionStore } from "./session-store";

vi.mock("@/api/session-api", () => ({
  getSession: vi.fn(),
  openSession: vi.fn(),
  closeSession: vi.fn(),
}));

const getSessionMock = vi.mocked(getSession);

describe("useSessionStore restore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getSessionMock.mockReset();
  });

  it("should treat a missing session as signed out without an error", async () => {
    getSessionMock.mockResolvedValue(undefined);
    const store = useSessionStore();

    await store.restore();

    expect(store.authenticated).toBe(false);
    expect(store.notice).toBe("");
    expect(store.checked).toBe(true);
  });

  it("should restore an existing session", async () => {
    getSessionMock.mockResolvedValue({ authenticated: true });
    const store = useSessionStore();

    await store.restore();

    expect(store.authenticated).toBe(true);
    expect(store.notice).toBe("");
  });

  it("should explain when Evolution GO rejects the stored token", async () => {
    getSessionMock.mockRejectedValue(
      new ApiError(401, "unauthorized", "Invalid instance token"),
    );
    const store = useSessionStore();

    await store.restore();

    expect(store.authenticated).toBe(false);
    expect(store.notice).toBe(
      "Token não encontrado. Confira o token da instância no Evolution GO.",
    );
  });
});
