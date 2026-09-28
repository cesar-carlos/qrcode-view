<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import BrandMark from "@/components/BrandMark.vue";
import QrPanel from "@/components/QrPanel.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { STATUS_POLL_INTERVAL_MS } from "@/constants";
import { useInstanceStore } from "@/stores/instance-store";
import { useSessionStore } from "@/stores/session-store";

const instance = useInstanceStore();
const session = useSessionStore();
const router = useRouter();
const pairPhone = ref("");
const confirmDisconnect = ref(false);
const copyMessage = ref("");
const disconnectNotice = ref("");
let pollTimer: ReturnType<typeof setInterval> | null = null;

function stopPolling(): void {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling(): void {
  stopPolling();
  pollTimer = setInterval(() => {
    void instance.refreshStatus().then(() => {
      if (instance.phase === "connected") {
        stopPolling();
        return;
      }
      if (instance.phase === "awaiting_qr") {
        void instance.refreshQr();
      }
    });
  }, STATUS_POLL_INTERVAL_MS);
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
  () => session.authenticated,
  (authenticated) => {
    if (!authenticated) {
      void router.push({ name: "token" });
    }
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
  await session.signOut();
  await router.push({ name: "token" });
}

async function confirmAndDisconnect(): Promise<void> {
  const succeeded = await instance.disconnect();
  confirmDisconnect.value = false;
  if (succeeded) {
    disconnectNotice.value = "WhatsApp desconectado";
  }
}

function startConnect(): void {
  disconnectNotice.value = "";
  void instance.connect();
}

function startPair(): void {
  disconnectNotice.value = "";
  void instance.pair(pairPhone.value);
}

function startReconnect(): void {
  disconnectNotice.value = "";
  void instance.reconnect();
}

async function copyPairingCode(): Promise<void> {
  if (instance.pairingCode === null) {
    return;
  }
  try {
    await navigator.clipboard.writeText(instance.pairingCode);
    copyMessage.value = "Código copiado";
  } catch {
    copyMessage.value = "Não foi possível copiar";
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
    <header class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3">
        <BrandMark size="sm" />
        <h1 class="text-2xl font-semibold text-zinc-900">
          {{ instance.status?.name || "Instância" }}
        </h1>
      </div>
      <StatusBadge
        :checking="instance.statusLoading || !instance.statusChecked"
        :failed="instance.statusFailed && instance.status === null"
        :logged-in="instance.status?.loggedIn ?? false"
        :connected="instance.status?.connected ?? false"
      />
    </header>

    <p
      v-if="instance.errorMessage"
      class="mt-6 text-sm text-red-700"
      role="alert"
    >
      {{ instance.errorMessage }}
    </p>

    <p
      v-if="disconnectNotice"
      class="mt-6 text-sm text-zinc-700"
      role="status"
      aria-live="polite"
    >
      {{ disconnectNotice }}
    </p>

    <section
      v-if="
        instance.statusChecked &&
        instance.statusFailed &&
        instance.status === null
      "
      class="mt-8 space-y-4"
    >
      <p class="text-sm leading-6 text-zinc-600">
        Não foi possível consultar esta instância.
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

    <section
      v-else-if="instance.statusChecked && instance.status?.loggedIn"
      class="mt-8 space-y-4"
    >
      <p class="text-sm leading-6 text-zinc-600">
        Este WhatsApp já está conectado nesta instância.
      </p>
      <div v-if="confirmDisconnect" class="space-y-3">
        <p class="text-sm text-zinc-800">
          Desconectar o WhatsApp? A instância continua existindo.
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="min-h-11 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="instance.busy"
            @click="confirmAndDisconnect"
          >
            {{
              instance.busyAction === "disconnect"
                ? "Desconectando…"
                : "Confirmar desconexão"
            }}
          </button>
          <button
            type="button"
            class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800"
            @click="confirmDisconnect = false"
          >
            Cancelar
          </button>
        </div>
      </div>
      <button
        v-else
        type="button"
        class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 disabled:opacity-60"
        :disabled="instance.busy"
        @click="confirmDisconnect = true"
      >
        Desconectar
      </button>
    </section>

    <template v-else-if="instance.statusChecked">
      <section class="mt-8">
        <button
          type="button"
          class="min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          :disabled="instance.busy"
          @click="startConnect"
        >
          {{
            instance.busyAction === "connect"
              ? "Conectando…"
              : "Conectar com QR Code"
          }}
        </button>
      </section>

      <QrPanel
        v-if="instance.phase === 'awaiting_qr'"
        class="mt-8"
        :qr="instance.qr"
      />

      <section class="mt-8 space-y-3">
        <h2 class="text-sm font-medium text-zinc-800">
          <label for="pair-phone">Parear com número de telefone</label>
        </h2>
        <p class="text-sm leading-6 text-zinc-600">
          No celular: WhatsApp, Aparelhos conectados, Conectar com número de
          telefone.
        </p>
        <input
          id="pair-phone"
          v-model="pairPhone"
          inputmode="tel"
          autocomplete="off"
          placeholder="5581999999999"
          class="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-600 focus:ring-2"
        />
        <button
          type="button"
          class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 disabled:opacity-60"
          :disabled="instance.busy || pairPhone.trim().length === 0"
          @click="startPair"
        >
          {{
            instance.busyAction === "pair" ? "Gerando código…" : "Gerar código"
          }}
        </button>
        <div v-if="instance.pairingCode" class="space-y-2">
          <p class="font-mono text-2xl tracking-widest text-zinc-900">
            {{ instance.pairingCode }}
          </p>
          <button
            type="button"
            class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800"
            @click="copyPairingCode"
          >
            Copiar código
          </button>
          <p v-if="copyMessage" class="text-sm text-zinc-600">
            {{ copyMessage }}
          </p>
        </div>
      </section>

      <section class="mt-8 space-y-3">
        <h2 class="text-sm font-medium text-zinc-800">
          Já pareou este WhatsApp antes?
        </h2>
        <button
          type="button"
          class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 disabled:opacity-60"
          :disabled="instance.busy"
          @click="startReconnect"
        >
          {{
            instance.busyAction === "reconnect" ? "Reconectando…" : "Reconectar"
          }}
        </button>
      </section>
    </template>

    <div class="mt-10">
      <button
        type="button"
        class="min-h-11 text-sm text-zinc-700"
        @click="leave"
      >
        Sair desta tela
      </button>
      <p class="text-sm text-zinc-500">Não desconecta o WhatsApp.</p>
    </div>
  </main>
</template>
