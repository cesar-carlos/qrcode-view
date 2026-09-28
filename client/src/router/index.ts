import { createRouter, createWebHistory } from "vue-router";
import { useSessionStore } from "@/stores/session-store";
import ConnectionView from "@/views/ConnectionView.vue";
import TokenView from "@/views/TokenView.vue";

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
  ],
});

router.beforeEach(async (to) => {
  const session = useSessionStore();
  if (!session.checked) {
    await session.restore();
  }
  if (to.meta.requiresAuth === true && !session.authenticated) {
    return { name: "token" };
  }
  if (to.name === "token" && session.authenticated) {
    return { name: "connection" };
  }
  return true;
});
