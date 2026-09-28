<script setup lang="ts">
import logoDark from "@/assets/logo-se7e-dark.png";

withDefaults(
  defineProps<{
    size?: "sm" | "md";
  }>(),
  { size: "md" },
);
</script>

<template>
  <img
    :src="logoDark"
    alt="Se7e"
    class="shrink-0"
    :class="size === 'sm' ? 'h-10 w-10' : 'h-14 w-14'"
  />
</template>
