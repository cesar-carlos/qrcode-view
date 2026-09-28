import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { messageForApiError } from "@/api/error-message";
import { ApiError } from "@/api/http";
import {
  connectInstance,
  disconnectInstance,
  getQrCode,
  getStatus,
  pairInstance,
  reconnectInstance,
  type InstanceStatus,
  type QrCode,
} from "@/api/instance-api";
import {
  deriveConnectionPhase,
  type ConnectionPhase,
} from "@/stores/connection-phase";
import { useSessionStore } from "@/stores/session-store";

export const useInstanceStore = defineStore("instance", () => {
  const status = ref<InstanceStatus | null>(null);
  const qr = ref<QrCode | null>(null);
  const pairingCode = ref<string | null>(null);
  const pendingAction = ref<"qr" | "pair" | null>(null);
  const errorMessage = ref("");
  const busy = ref(false);
  const busyAction = ref<"connect" | "pair" | "reconnect" | "disconnect" | null>(
    null,
  );
  const statusChecked = ref(false);
  const statusLoading = ref(false);
  const statusFailed = ref(false);

  const phase = computed<ConnectionPhase>(() =>
    deriveConnectionPhase({
      loggedIn: status.value?.loggedIn ?? false,
      connected: status.value?.connected ?? false,
      pendingAction: pendingAction.value,
    }),
  );

  async function guard<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      errorMessage.value = "";
      return await action();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        useSessionStore().markSignedOut();
        return null;
      }
      errorMessage.value = messageForApiError(
        error,
        "Não foi possível concluir a ação",
      );
      return null;
    }
  }

  async function refreshStatus(): Promise<void> {
    const showLoading = status.value === null;
    if (showLoading) {
      statusLoading.value = true;
    }
    try {
      const next = await guard(() => getStatus());
      if (next) {
        statusFailed.value = false;
        status.value = next;
        if (next.loggedIn) {
          pendingAction.value = null;
          qr.value = null;
          pairingCode.value = null;
        }
        return;
      }
      if (status.value === null) {
        statusFailed.value = true;
      }
    } finally {
      statusLoading.value = false;
      statusChecked.value = true;
    }
  }

  async function refreshQr(): Promise<void> {
    const next = await guard(() => getQrCode());
    if (next) {
      qr.value = next;
    }
  }

  async function runAction(
    action: "connect" | "pair" | "reconnect" | "disconnect",
    work: () => Promise<void>,
  ): Promise<void> {
    busyAction.value = action;
    busy.value = true;
    try {
      await work();
    } finally {
      busy.value = false;
      busyAction.value = null;
    }
  }

  async function connect(): Promise<void> {
    await runAction("connect", async () => {
      const started = await guard(() => connectInstance({}));
      if (!started) {
        return;
      }
      pendingAction.value = "qr";
      pairingCode.value = null;
      await refreshStatus();
      await refreshQr();
    });
  }

  async function pair(phone: string): Promise<void> {
    await runAction("pair", async () => {
      const result = await guard(() => pairInstance(phone));
      if (!result) {
        return;
      }
      pendingAction.value = "pair";
      pairingCode.value = result.pairingCode;
    });
  }

  async function reconnect(): Promise<void> {
    await runAction("reconnect", async () => {
      const result = await guard(() => reconnectInstance());
      if (result) {
        await refreshStatus();
      }
    });
  }

  async function disconnect(): Promise<boolean> {
    let succeeded = false;
    await runAction("disconnect", async () => {
      const result = await guard(() => disconnectInstance());
      if (!result) {
        return;
      }
      pendingAction.value = null;
      qr.value = null;
      pairingCode.value = null;
      await refreshStatus();
      succeeded = !status.value?.loggedIn;
    });
    return succeeded;
  }

  return {
    status,
    qr,
    pairingCode,
    phase,
    errorMessage,
    busy,
    busyAction,
    statusChecked,
    statusLoading,
    statusFailed,
    refreshStatus,
    refreshQr,
    connect,
    pair,
    reconnect,
    disconnect,
  };
});
