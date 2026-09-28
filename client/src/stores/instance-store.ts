import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { messageForApiError, type UserAction } from "@/api/error-message";
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
import { shouldKeepCurrentQr } from "@/qr-code";
import {
  deriveConnectionPhase,
  type ConnectionPhase,
} from "@/stores/connection-phase";
import { useSessionStore } from "@/stores/session-store";

type ErrorOrigin = "action" | "status" | "qr";

// A status or QR poll must not replace an error from a button the user just pressed.
const failureRank: Record<ErrorOrigin, number> = {
  action: 3,
  qr: 2,
  status: 1,
};

export const useInstanceStore = defineStore("instance", () => {
  const status = ref<InstanceStatus | null>(null);
  const qr = ref<QrCode | null>(null);
  const pairingCode = ref<string | null>(null);
  const pendingAction = ref<"qr" | "pair" | null>(null);
  const errorMessage = ref("");
  const errorOrigin = ref<ErrorOrigin | null>(null);
  const busy = ref(false);
  const busyAction = ref<
    "connect" | "pair" | "reconnect" | "disconnect" | null
  >(null);
  const statusChecked = ref(false);
  const statusLoading = ref(false);
  const statusFailed = ref(false);
  const qrRefreshing = ref(false);

  function reset(): void {
    status.value = null;
    qr.value = null;
    pairingCode.value = null;
    pendingAction.value = null;
    errorMessage.value = "";
    errorOrigin.value = null;
    busy.value = false;
    busyAction.value = null;
    statusChecked.value = false;
    statusLoading.value = false;
    statusFailed.value = false;
    qrRefreshing.value = false;
  }

  const phase = computed<ConnectionPhase>(() =>
    deriveConnectionPhase({
      loggedIn: status.value?.loggedIn ?? false,
      connected: status.value?.connected ?? false,
      pendingAction: pendingAction.value,
    }),
  );

  function reportFailure(
    origin: ErrorOrigin,
    error: unknown,
    action: UserAction,
  ): void {
    if (
      errorOrigin.value !== null &&
      failureRank[errorOrigin.value] > failureRank[origin]
    ) {
      return;
    }
    errorOrigin.value = origin;
    const message = messageForApiError(error, action);
    errorMessage.value =
      origin === "qr" && qr.value?.imageSrc
        ? `${message} O QR Code na tela continua válido.`
        : message;
  }

  function clearFailure(origin: ErrorOrigin): void {
    if (errorOrigin.value !== origin) {
      return;
    }
    errorOrigin.value = null;
    errorMessage.value = "";
  }

  async function guard<T>(
    work: () => Promise<T>,
    options: { origin: ErrorOrigin; action: UserAction },
  ): Promise<T | null> {
    if (options.origin === "action") {
      errorMessage.value = "";
      errorOrigin.value = null;
    }
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        useSessionStore().markSignedOut(messageForApiError(error, "session"));
        return null;
      }
      reportFailure(options.origin, error, options.action);
      return null;
    }
  }

  async function refreshStatus(): Promise<void> {
    const showLoading = status.value === null;
    if (showLoading) {
      statusLoading.value = true;
    }
    try {
      const next = await guard(() => getStatus(), {
        origin: "status",
        action: "status",
      });
      if (next) {
        statusFailed.value = false;
        clearFailure("status");
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

  async function refreshQr(manual = false): Promise<boolean> {
    if (manual) {
      if (qrRefreshing.value) {
        return false;
      }
      qrRefreshing.value = true;
    }
    try {
      const next = await guard(() => getQrCode(), {
        origin: manual ? "action" : "qr",
        action: "qr",
      });
      if (next === null) {
        return false;
      }
      clearFailure("qr");
      if (shouldKeepCurrentQr(qr.value, next)) {
        return false;
      }
      qr.value = next;
      return true;
    } finally {
      if (manual) {
        qrRefreshing.value = false;
      }
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
      const started = await guard(() => connectInstance({}), {
        origin: "action",
        action: "connect",
      });
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
      const result = await guard(() => pairInstance(phone), {
        origin: "action",
        action: "pair",
      });
      if (!result) {
        return;
      }
      pendingAction.value = "pair";
      pairingCode.value = result.pairingCode;
    });
  }

  async function reconnect(): Promise<void> {
    await runAction("reconnect", async () => {
      const result = await guard(() => reconnectInstance(), {
        origin: "action",
        action: "reconnect",
      });
      if (result) {
        await refreshStatus();
      }
    });
  }

  async function disconnect(): Promise<boolean> {
    let succeeded = false;
    await runAction("disconnect", async () => {
      const result = await guard(() => disconnectInstance(), {
        origin: "action",
        action: "disconnect",
      });
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
    qrRefreshing,
    reset,
    refreshStatus,
    refreshQr,
    connect,
    pair,
    reconnect,
    disconnect,
  };
});
