import { defineStore } from "pinia";
import { ref } from "vue";
import { ApiError } from "@/api/http";
import { messageForApiError } from "@/api/error-message";
import { closeSession, openSession } from "@/api/session-api";
import { getStatus } from "@/api/instance-api";

export const useSessionStore = defineStore("session", () => {
  const authenticated = ref(false);
  const checked = ref(false);
  const notice = ref("");

  async function restore(): Promise<void> {
    try {
      await getStatus();
      authenticated.value = true;
    } catch (error: unknown) {
      authenticated.value = false;
      if (!(error instanceof ApiError && error.status === 401)) {
        notice.value = messageForApiError(error, "restore");
      }
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

  function markSignedOut(message = ""): void {
    authenticated.value = false;
    notice.value = message;
  }

  function consumeNotice(): string {
    const current = notice.value;
    notice.value = "";
    return current;
  }

  return {
    authenticated,
    checked,
    notice,
    restore,
    open,
    signOut,
    markSignedOut,
    consumeNotice,
  };
});
