<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { messageForApiError } from "@/api/error-message";
import BrandMark from "@/components/BrandMark.vue";
import { useSessionStore } from "@/stores/session-store";

const token = ref("");
const visible = ref(false);
const errorMessage = ref("");
const submitting = ref(false);
const session = useSessionStore();
const router = useRouter();

async function submit(): Promise<void> {
  submitting.value = true;
  errorMessage.value = "";
  try {
    await session.open(token.value);
    token.value = "";
    await router.push({ name: "connection" });
  } catch (error: unknown) {
    errorMessage.value = messageForApiError(
      error,
      "Não foi possível validar o token",
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main
    class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12"
  >
    <BrandMark />
    <h1 class="mt-4 text-3xl font-semibold text-zinc-900">
      Conectar instância
    </h1>
    <p class="mt-3 text-sm leading-6 text-zinc-600">
      Informe o token da instância que você já possui. Esta tela não cria nem
      apaga instâncias.
    </p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <label
        class="block text-sm font-medium text-zinc-800"
        for="instance-token"
        >Token da instância</label
      >
      <div class="flex gap-2">
        <input
          id="instance-token"
          v-model="token"
          data-testid="instance-token"
          :type="visible ? 'text' : 'password'"
          autocomplete="off"
          required
          class="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-600 focus:ring-2"
        />
        <button
          type="button"
          class="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
          :aria-pressed="visible"
          @click="visible = !visible"
        >
          {{ visible ? "Ocultar" : "Mostrar" }}
        </button>
      </div>
      <p v-if="errorMessage" class="text-sm text-red-700" role="alert">
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        class="min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        :disabled="submitting || token.trim().length === 0"
      >
        {{ submitting ? "Validando..." : "Entrar" }}
      </button>
    </form>
  </main>
</template>
