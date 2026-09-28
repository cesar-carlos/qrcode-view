<script setup lang="ts">
import { computed } from "vue";
import {
  formatPairingCode,
  formatPairingPhone,
  normalizePairingPhone,
  pairingPhoneDigits,
} from "@/pairing-phone";

const props = defineProps<{
  phone: string;
  phoneError: string | null;
  pairingCode: string | null;
  copyMessage: string;
  busy: boolean;
  generating: boolean;
}>();

const emit = defineEmits<{
  "update:phone": [value: string];
  pair: [];
  copy: [];
}>();

const displayPhone = computed(() => formatPairingPhone(props.phone));

function onPhoneInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  const digits = pairingPhoneDigits(target.value);
  emit("update:phone", normalizePairingPhone(digits) ?? digits);
}
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-sm font-medium text-zinc-800">
      <label for="pair-phone">Parear com número de telefone</label>
    </h2>
    <p id="pair-phone-hint" class="text-sm leading-6 text-zinc-600">
      DDI + DDD + número. Ex.: +55 (81) 99999-9999
    </p>
    <input
      id="pair-phone"
      inputmode="tel"
      autocomplete="off"
      placeholder="+55 (81) 99999-9999"
      :value="displayPhone"
      :aria-describedby="
        phoneError ? 'pair-phone-error pair-phone-hint' : 'pair-phone-hint'
      "
      :aria-invalid="phoneError !== null"
      class="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-600 focus:ring-2"
      @input="onPhoneInput"
    />
    <p
      v-if="phoneError"
      id="pair-phone-error"
      class="text-sm text-red-700"
      role="alert"
    >
      {{ phoneError }}
    </p>
    <button
      type="button"
      class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 disabled:opacity-60"
      :disabled="busy || phone.trim().length === 0 || phoneError !== null"
      @click="emit('pair')"
    >
      {{
        generating
          ? "Gerando código…"
          : pairingCode
            ? "Gerar outro código"
            : "Gerar código"
      }}
    </button>
    <div v-if="pairingCode" class="space-y-2">
      <p
        data-testid="pairing-code"
        class="font-mono text-2xl tracking-widest text-zinc-900"
      >
        {{ formatPairingCode(pairingCode) }}
      </p>
      <p class="text-sm leading-6 text-zinc-600">
        Digite este código agora no celular: WhatsApp, Aparelhos conectados,
        Conectar com número de telefone. Ele expira rápido.
      </p>
      <button
        type="button"
        class="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800"
        @click="emit('copy')"
      >
        Copiar código
      </button>
      <p v-if="copyMessage" class="text-sm text-zinc-600">
        {{ copyMessage }}
      </p>
    </div>
  </section>
</template>
