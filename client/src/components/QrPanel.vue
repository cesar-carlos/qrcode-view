<script setup lang="ts">
import type { QrCode } from "@/api/instance-api";

defineProps<{
  qr: QrCode | null;
}>();
</script>

<template>
  <section class="rounded-xl border border-zinc-200 bg-white p-4">
    <h2 class="text-sm font-medium text-zinc-800">
      Aponte a câmera do WhatsApp
    </h2>
    <p class="mt-1 text-sm leading-6 text-zinc-600">
      No celular: WhatsApp, Aparelhos conectados, Conectar aparelho.
    </p>
    <img
      v-if="qr?.imageSrc"
      :src="qr.imageSrc"
      alt="QR Code para conectar o WhatsApp"
      class="mx-auto mt-4 block h-56 w-56 rounded-lg bg-white object-contain"
    />
    <p v-else class="mt-4 text-sm text-zinc-600">
      Aguardando o QR Code da instância.
    </p>
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
