import { createRouter, createWebHistory } from "vue-router";
import { messageForApiError } from "@/api/error-message";
import { useSessionStore } from "@/stores/session-store";
import ConnectionView from "@/views/ConnectionView.vue";
import TokenView from "@/views/TokenView.vue";
import { readInstanceTokenLink } from "./instance-token-link";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "token", component: TokenView },
    {
      path: "/conectar",
      name: "connection",
      component: ConnectionView,
      meta: { requiresAuth: true },
    },
    { path: "/:token", name: "token-link", component: TokenView },
  ],
});

router.beforeEach(async (to) => {
  const session = useSessionStore();
  if (!session.checked) {
    await session.restore();
  }

  const linkToken = readInstanceTokenLink({
    params: {
      token:
        typeof to.params.token === "string" || Array.isArray(to.params.token)
          ? to.params.token
          : undefined,
    },
    query: {
      token: to.query.token,
    },
  });
  if (linkToken !== null) {
    try {
      await session.open(linkToken);
    } catch (error: unknown) {
      await session.signOut();
      session.markSignedOut(messageForApiError(error, "session"));
      return { name: "token", replace: true };
    }
    return { name: "connection", replace: true };
  }

  if (to.meta.requiresAuth === true && !session.authenticated) {
    return { name: "token" };
  }
  if (to.name === "token" && session.authenticated) {
    return { name: "connection" };
  }
  return true;
});
