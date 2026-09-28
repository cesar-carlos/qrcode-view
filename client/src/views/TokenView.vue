<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { messageForApiError } from "@/api/error-message";
import BrandMark from "@/components/BrandMark.vue";
import { useSessionStore } from "@/stores/session-store";

const token = ref("");
const visible = ref(false);
const errorMessage = ref("");
const submitting = ref(false);
const canPaste = ref(false);
const tokenInput = ref<HTMLInputElement | null>(null);
const session = useSessionStore();
const router = useRouter();

onMounted(() => {
  const pendingNotice = session.consumeNotice();
  if (pendingNotice.length > 0) {
    errorMessage.value = pendingNotice;
  }
  canPaste.value =
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.readText === "function";
  tokenInput.value?.focus();
});

async function pasteToken(): Promise<void> {
  errorMessage.value = "";
  try {
    const text = await navigator.clipboard.readText();
    token.value = text.trim();
    tokenInput.value?.focus();
  } catch {
    errorMessage.value =
      "Não foi possível colar o token. Permita o acesso à área de transferência ou digite o token.";
  }
}

async function submit(): Promise<void> {
  submitting.value = true;
  errorMessage.value = "";
  try {
    await session.open(token.value);
    token.value = "";
    await router.push({ name: "connection" });
  } catch (error: unknown) {
    errorMessage.value = messageForApiError(error, "session");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main
    class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12"
  >
    <BrandMark class="self-center" />
    <h1 class="mt-4 text-center text-3xl font-semibold text-zinc-900">
      Conectar instância
    </h1>
    <p class="mt-3 text-sm leading-6 text-zinc-600">
      Informe o token da instância no Evolution GO. Não é a senha do WhatsApp.
      Esta tela não cria nem apaga instâncias.
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
          ref="tokenInput"
          v-model="token"
          data-testid="instance-token"
          :type="visible ? 'text' : 'password'"
          autocomplete="off"
          required
          class="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-600 focus:ring-2"
        />
        <button
          type="button"
          class="min-h-11 shrink-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
          :aria-pressed="visible"
          @click="visible = !visible"
        >
          {{ visible ? "Ocultar" : "Mostrar" }}
        </button>
      </div>
      <button
        v-if="canPaste"
        type="button"
        data-testid="paste-token"
        class="min-h-11 text-sm font-medium text-emerald-800"
        @click="pasteToken"
      >
        Colar token
      </button>
      <p
        v-if="errorMessage"
        class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        :disabled="submitting || token.trim().length === 0"
      >
        <svg
          v-if="submitting"
          class="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        {{ submitting ? "Validando…" : "Entrar" }}
      </button>
    </form>
  </main>
</template>
