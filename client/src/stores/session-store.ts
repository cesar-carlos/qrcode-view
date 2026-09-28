import { defineStore } from "pinia";
import { ref } from "vue";
import { closeSession, openSession } from "@/api/session-api";
import { getStatus } from "@/api/instance-api";

export const useSessionStore = defineStore("session", () => {
  const authenticated = ref(false);
  const checked = ref(false);

  async function restore(): Promise<void> {
    try {
      await getStatus();
      authenticated.value = true;
    } catch {
      authenticated.value = false;
    } finally {
      checked.value = true;
    }
  }

  async function open(token: string): Promise<void> {
    await openSession(token);
    authenticated.value = true;
    checked.value = true;
  }

  async function signOut(): Promise<void> {
    await closeSession();
    authenticated.value = false;
  }

  function markSignedOut(): void {
    authenticated.value = false;
  }

  return { authenticated, checked, restore, open, signOut, markSignedOut };
});
