<script setup lang="ts">
const emit = defineEmits<{
  leave: [];
}>();
</script>

<template>
  <div>
    <button
      type="button"
      data-testid="leave-session"
      class="min-h-11 text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
      @click="emit('leave')"
    >
      Usar outra instância
    </button>
    <p class="text-sm text-zinc-500">Não desconecta o WhatsApp.</p>
  </div>
</template>
