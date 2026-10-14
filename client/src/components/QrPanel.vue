<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import type { QrCode } from "@/api/instance-api";

const props = defineProps<{
  qr: QrCode | null;
  refreshing: boolean;
  secondsLeft: number | null;
  openedOnPhone: boolean;
}>();

function filled(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.length > 0;
}

const passkeyActive = computed(
  () =>
    filled(props.qr?.passkeyStage) ||
    filled(props.qr?.passkeyOpenUrl) ||
    filled(props.qr?.passkeyCode),
);

const emit = defineEmits<{
  refresh: [];
}>();

const flash = ref(false);
let flashTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.qr?.imageSrc,
  (next, previous) => {
    if (next === undefined || next === null || next === previous) {
      return;
    }
    flash.value = true;
    if (flashTimer !== null) {
      clearTimeout(flashTimer);
    }
    flashTimer = setTimeout(() => {
      flash.value = false;
      flashTimer = null;
    }, 500);
  },
);

onUnmounted(() => {
  if (flashTimer !== null) {
    clearTimeout(flashTimer);
  }
});
</script>

<template>
  <section class="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
    <h2 class="text-sm font-medium text-zinc-800">
      {{
        passkeyActive ? "Confirme no WhatsApp" : "Aponte a câmera do WhatsApp"
      }}
    </h2>
    <p class="mt-1 text-sm leading-6 text-zinc-600">
      <template v-if="passkeyActive">
        O WhatsApp pediu uma confirmação extra. Abra o WhatsApp Web, conclua a
        verificação e confira o código abaixo se ele aparecer.
      </template>
      <template v-else-if="openedOnPhone">
        Esta tela está no celular. Abra a mesma página em outro aparelho e
        aponte a câmera do WhatsApp para o QR Code.
      </template>
      <template v-else>
        No celular: WhatsApp, Aparelhos conectados, Conectar aparelho.
      </template>
    </p>
    <img
      v-if="qr?.imageSrc && !passkeyActive"
      :src="qr.imageSrc"
      alt="QR Code para conectar o WhatsApp"
      class="mx-auto mt-4 block h-72 w-72 rounded-lg bg-white object-contain p-3 sm:h-80 sm:w-80"
      :class="flash ? 'ring-2 ring-emerald-400 ring-offset-2' : ''"
    />
    <p v-else-if="!passkeyActive" class="mt-4 text-sm text-zinc-600">
      Aguardando o QR Code da instância.
    </p>
    <p
      v-if="secondsLeft !== null && !passkeyActive"
      data-testid="qr-countdown"
      class="mt-3 text-center text-sm text-zinc-500"
      role="status"
      aria-live="polite"
    >
      {{
        refreshing || secondsLeft === 0
          ? "Atualizando…"
          : `Atualiza em ${secondsLeft}s`
      }}
    </p>
    <button
      type="button"
      class="mt-4 min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 disabled:opacity-60"
      :disabled="refreshing"
      @click="emit('refresh')"
    >
      {{
        refreshing
          ? "Atualizando…"
          : passkeyActive
            ? "Atualizar"
            : "Atualizar QR Code"
      }}
    </button>
    <a
      v-if="qr?.passkeyOpenUrl"
      :href="qr.passkeyOpenUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-emerald-800"
    >
      Abrir WhatsApp Web
    </a>
    <p v-if="qr?.passkeyCode" class="mt-2 text-sm text-zinc-700">
      Código de confirmação: {{ qr.passkeyCode }}
    </p>
  </section>
</template>
