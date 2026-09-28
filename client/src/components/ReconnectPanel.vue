<script setup lang="ts">
defineProps<{
  busy: boolean;
  reconnecting: boolean;
}>();

const emit = defineEmits<{
  reconnect: [];
}>();
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-sm font-medium text-zinc-800">
      Já pareou este WhatsApp antes?
    </h2>
    <button
      type="button"
      class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 disabled:opacity-60"
      :disabled="busy"
      @click="emit('reconnect')"
    >
      {{ reconnecting ? "Reconectando…" : "Reconectar" }}
    </button>
  </section>
</template>
