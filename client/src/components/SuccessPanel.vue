<script setup lang="ts">
defineProps<{
  instanceName: string;
  confirmDisconnect: boolean;
  busy: boolean;
  disconnecting: boolean;
}>();

const emit = defineEmits<{
  requestDisconnect: [];
  confirmDisconnect: [];
  cancelDisconnect: [];
}>();
</script>

<template>
  <section
    data-testid="success-panel"
    class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center"
  >
    <div
      class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white"
      aria-hidden="true"
    >
      <svg
        class="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h1 class="mt-4 text-2xl font-semibold text-zinc-900">
      {{ instanceName }}
    </h1>
    <p
      class="mt-2 text-lg font-semibold text-emerald-800"
      role="status"
      aria-live="polite"
    >
      WhatsApp conectado
    </p>
    <p class="mx-auto mt-2 max-w-sm text-base leading-7 text-zinc-600">
      A conexão foi concluída. Esta instância está logada e pronta para uso.
      Pode fechar esta página.
    </p>

    <div class="mt-8">
      <div v-if="confirmDisconnect" class="space-y-3">
        <p class="text-sm text-zinc-800">
          Desconectar o WhatsApp? A instância continua existindo.
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            class="min-h-11 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="busy"
            @click="emit('confirmDisconnect')"
          >
            {{ disconnecting ? "Desconectando…" : "Confirmar desconexão" }}
          </button>
          <button
            type="button"
            class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800"
            @click="emit('cancelDisconnect')"
          >
            Cancelar
          </button>
        </div>
      </div>
      <button
        v-else
        type="button"
        data-testid="disconnect"
        class="min-h-11 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
        :disabled="busy"
        @click="emit('requestDisconnect')"
      >
        Desconectar WhatsApp
      </button>
    </div>
  </section>
</template>
