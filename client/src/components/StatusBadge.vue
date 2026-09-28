<script setup lang="ts">
defineProps<{
  loggedIn: boolean;
  connected: boolean;
  checking: boolean;
  failed: boolean;
}>();
</script>

<template>
  <span
    class="inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-medium"
    role="status"
    aria-live="polite"
    :class="
      checking
        ? 'bg-zinc-100 text-zinc-600'
        : failed
          ? 'bg-red-100 text-red-800'
          : loggedIn
            ? 'bg-emerald-100 text-emerald-800'
            : connected
              ? 'bg-amber-100 text-amber-800'
              : 'bg-zinc-100 text-zinc-700'
    "
  >
    {{
      checking
        ? "Verificando…"
        : failed
          ? "Não foi possível verificar"
          : loggedIn
            ? "Logado no WhatsApp"
            : connected
              ? "Aguardando o QR Code"
              : "Desconectado"
    }}
  </span>
</template>
