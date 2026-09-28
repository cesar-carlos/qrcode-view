<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import BrandMark from "@/components/BrandMark.vue";
import LeaveSession from "@/components/LeaveSession.vue";
import PairingPanel from "@/components/PairingPanel.vue";
import QrPanel from "@/components/QrPanel.vue";
import ReconnectPanel from "@/components/ReconnectPanel.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import SuccessPanel from "@/components/SuccessPanel.vue";
import {
  QR_FIRST_LIFETIME_MS,
  QR_LIFETIME_MS,
  STATUS_POLL_INTERVAL_MS,
} from "@/constants";
import { useNarrowViewport } from "@/narrow-viewport";
import { pairingPhoneError } from "@/pairing-phone";
import { useInstanceStore } from "@/stores/instance-store";
import { useSessionStore } from "@/stores/session-store";

const instance = useInstanceStore();
const session = useSessionStore();
const router = useRouter();
const isNarrow = useNarrowViewport();
const pairPhone = ref("");
const pairPhoneError = computed(() => pairingPhoneError(pairPhone.value));
const confirmDisconnect = ref(false);
const copyMessage = ref("");
const disconnectNotice = ref("");
const secondsLeft = ref<number | null>(null);
const skipAutoConnect = ref(false);
const didAutoConnect = ref(false);
const instanceName = computed(() => instance.status?.name || "Instância");
const showStatusFailure = computed(
  () =>
    instance.statusChecked && instance.statusFailed && instance.status === null,
);
const showQrPanel = computed(
  () => instance.phase === "awaiting_qr" && instance.pairingCode === null,
);
const showQrConnectButton = computed(
  () =>
    instance.pairingCode === null &&
    instance.phase !== "awaiting_qr" &&
    instance.busyAction !== "connect",
);
const connectingQr = computed(
  () => instance.busyAction === "connect" && !showQrPanel.value,
);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let qrWindow: "first" | "later" = "first";
let qrRefreshInFlight = false;

function stopPolling(): void {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (tickTimer !== null) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
  secondsLeft.value = null;
  qrWindow = "first";
  qrRefreshInFlight = false;
}

function startCountdown(): void {
  const lifetimeMs =
    qrWindow === "first" ? QR_FIRST_LIFETIME_MS : QR_LIFETIME_MS;
  secondsLeft.value = Math.floor(lifetimeMs / 1000);
  if (tickTimer !== null) {
    clearInterval(tickTimer);
  }
  tickTimer = setInterval(() => {
    if (secondsLeft.value === null) {
      return;
    }
    if (secondsLeft.value <= 0) {
      void refreshHeldQr();
      return;
    }
    secondsLeft.value -= 1;
  }, 1000);
}

function startPolling(): void {
  if (pollTimer !== null) {
    return;
  }
  if (instance.qr?.imageSrc && tickTimer === null) {
    startCountdown();
  }
  pollTimer = setInterval(() => {
    void instance.refreshStatus().then(() => {
      if (instance.phase === "connected") {
        stopPolling();
        return;
      }
      if (instance.phase === "awaiting_qr" && !instance.qr?.imageSrc) {
        void instance.refreshQr();
      }
    });
  }, STATUS_POLL_INTERVAL_MS);
}

async function refreshHeldQr(): Promise<void> {
  if (qrRefreshInFlight || instance.phase !== "awaiting_qr") {
    return;
  }
  qrRefreshInFlight = true;
  qrWindow = "later";
  try {
    const changed = await instance.refreshQr();
    if (!changed && instance.qr?.imageSrc && instance.phase === "awaiting_qr") {
      startCountdown();
    }
  } finally {
    qrRefreshInFlight = false;
  }
}

watch(
  () => instance.phase,
  (phase) => {
    if (phase === "connected") {
      confirmDisconnect.value = false;
    }
    if (phase === "awaiting_qr" || phase === "awaiting_pair") {
      startPolling();
      return;
    }
    stopPolling();
  },
);

watch(
  () => instance.qr?.code ?? instance.qr?.imageSrc ?? null,
  (next) => {
    if (next === null) {
      return;
    }
    startCountdown();
  },
);

watch(
  () => session.authenticated,
  (authenticated) => {
    if (!authenticated) {
      void router.push({ name: "token" });
    }
  },
);

watch(
  () =>
    instance.statusChecked &&
    !instance.statusFailed &&
    instance.status !== null &&
    !instance.status.loggedIn &&
    !isNarrow.value &&
    !skipAutoConnect.value,
  (shouldAutoConnect) => {
    if (!shouldAutoConnect || didAutoConnect.value || instance.busy) {
      return;
    }
    didAutoConnect.value = true;
    if (instance.status?.connected === true) {
      void instance.refreshQr();
      return;
    }
    startConnect();
  },
);

onMounted(() => {
  void instance.refreshStatus();
});

onUnmounted(() => {
  stopPolling();
});

async function leave(): Promise<void> {
  stopPolling();
  instance.reset();
  await session.signOut();
  await router.push({ name: "token" });
}

async function confirmAndDisconnect(): Promise<void> {
  const succeeded = await instance.disconnect();
  if (!succeeded) {
    if (!session.authenticated) {
      confirmDisconnect.value = false;
    }
    return;
  }
  confirmDisconnect.value = false;
  skipAutoConnect.value = true;
  disconnectNotice.value = "WhatsApp desconectado";
}

function startConnect(): void {
  disconnectNotice.value = "";
  void instance.connect();
}

function updateQr(): void {
  qrWindow = "later";
  void instance.refreshQr(true).then((changed) => {
    if (!changed && instance.qr?.imageSrc && instance.phase === "awaiting_qr") {
      startCountdown();
    }
  });
}

function startPair(): void {
  if (pairPhoneError.value !== null || pairPhone.value.trim().length === 0) {
    return;
  }
  disconnectNotice.value = "";
  void instance.pair(pairPhone.value);
}

function startReconnect(): void {
  disconnectNotice.value = "";
  void instance.reconnect();
}

function onOtherMethodsToggle(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLDetailsElement) || !target.open) {
    return;
  }
  if (
    isNarrow.value &&
    instance.phase === "disconnected" &&
    !instance.busy &&
    instance.pairingCode === null
  ) {
    startConnect();
  }
}

async function copyPairingCode(): Promise<void> {
  if (instance.pairingCode === null) {
    return;
  }
  try {
    await navigator.clipboard.writeText(instance.pairingCode);
    copyMessage.value = "Código copiado";
  } catch {
    copyMessage.value =
      "Não foi possível copiar o código. Selecione o código e copie manualmente.";
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
    <header class="flex flex-col items-center gap-4">
      <BrandMark :size="instance.status?.loggedIn ? 'sm' : 'md'" />
      <div
        v-if="!instance.statusChecked"
        class="flex w-full items-center justify-between gap-4"
        aria-busy="true"
        data-testid="status-skeleton"
      >
        <div class="h-8 w-44 animate-pulse rounded-md bg-zinc-200" />
        <div class="h-7 w-28 animate-pulse rounded-full bg-zinc-200" />
      </div>
      <div
        v-else-if="!instance.status?.loggedIn"
        class="flex w-full items-start justify-between gap-4"
      >
        <h1 class="text-2xl font-semibold text-zinc-900">
          {{ instanceName }}
        </h1>
        <StatusBadge
          :checking="instance.statusLoading"
          :failed="instance.statusFailed && instance.status === null"
          :logged-in="false"
          :connected="instance.status?.connected ?? false"
        />
      </div>
    </header>

    <p
      v-if="instance.errorMessage && !showStatusFailure"
      class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      role="alert"
    >
      {{ instance.errorMessage }}
    </p>

    <p
      v-if="disconnectNotice"
      class="mt-6 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700"
      role="status"
      aria-live="polite"
    >
      {{ disconnectNotice }}
    </p>

    <section v-if="showStatusFailure" class="mt-8 space-y-4">
      <p
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
        role="alert"
      >
        {{
          instance.errorMessage ||
          "Não foi possível consultar esta instância. Tente de novo."
        }}
      </p>
      <button
        type="button"
        class="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        :disabled="instance.statusLoading"
        @click="instance.refreshStatus()"
      >
        {{ instance.statusLoading ? "Verificando…" : "Tentar de novo" }}
      </button>
    </section>

    <SuccessPanel
      v-else-if="instance.statusChecked && instance.status?.loggedIn"
      :instance-name="instanceName"
      :confirm-disconnect="confirmDisconnect"
      :busy="instance.busy"
      :disconnecting="instance.busyAction === 'disconnect'"
      @request-disconnect="confirmDisconnect = true"
      @confirm-disconnect="confirmAndDisconnect"
      @cancel-disconnect="confirmDisconnect = false"
    />

    <template v-else-if="instance.statusChecked">
      <p v-if="connectingQr" class="mt-8 text-sm text-zinc-600" role="status">
        Gerando o QR Code…
      </p>

      <PairingPanel
        v-if="isNarrow"
        class="mt-8"
        :phone="pairPhone"
        :phone-error="pairPhoneError"
        :pairing-code="instance.pairingCode"
        :copy-message="copyMessage"
        :busy="instance.busy"
        :generating="instance.busyAction === 'pair'"
        @update:phone="pairPhone = $event"
        @pair="startPair"
        @copy="copyPairingCode"
      />

      <template v-else>
        <section v-if="showQrConnectButton" class="mt-8">
          <button
            type="button"
            class="min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="instance.busy"
            @click="startConnect"
          >
            Conectar com QR Code
          </button>
        </section>

        <QrPanel
          v-if="showQrPanel"
          class="mt-8"
          :qr="instance.qr"
          :refreshing="instance.qrRefreshing"
          :seconds-left="secondsLeft"
          @refresh="updateQr"
        />
      </template>

      <details
        class="mt-8 rounded-xl border border-zinc-200 bg-white px-4 py-2"
        data-testid="other-methods"
        @toggle="onOtherMethodsToggle"
      >
        <summary
          class="min-h-11 cursor-pointer list-none py-2 text-sm font-medium text-zinc-800 [&::-webkit-details-marker]:hidden"
        >
          Outras formas de conectar
        </summary>
        <div class="space-y-8 border-t border-zinc-200 py-4">
          <template v-if="isNarrow">
            <section class="space-y-4">
              <button
                v-if="showQrConnectButton"
                type="button"
                class="min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                :disabled="instance.busy"
                @click="startConnect"
              >
                Conectar com QR Code
              </button>
              <QrPanel
                v-if="showQrPanel"
                :qr="instance.qr"
                :refreshing="instance.qrRefreshing"
                :seconds-left="secondsLeft"
                @refresh="updateQr"
              />
            </section>
            <ReconnectPanel
              :busy="instance.busy"
              :reconnecting="instance.busyAction === 'reconnect'"
              @reconnect="startReconnect"
            />
          </template>
          <template v-else>
            <PairingPanel
              :phone="pairPhone"
              :phone-error="pairPhoneError"
              :pairing-code="instance.pairingCode"
              :copy-message="copyMessage"
              :busy="instance.busy"
              :generating="instance.busyAction === 'pair'"
              @update:phone="pairPhone = $event"
              @pair="startPair"
              @copy="copyPairingCode"
            />
            <ReconnectPanel
              :busy="instance.busy"
              :reconnecting="instance.busyAction === 'reconnect'"
              @reconnect="startReconnect"
            />
          </template>
        </div>
      </details>
    </template>

    <LeaveSession class="mt-10" @leave="leave" />
  </main>
</template>
