import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "catalogo",
      component: () => import("../views/Catalogo.vue"),
    },
    {
      path: "/checkout",
      name: "checkout",
      component: () => import("../views/Checkout.vue"),
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/Auth.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/Admin.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const { isAuthenticated, isAdmin, initAuth } = useAuth();
  await initAuth();

  if (to.meta?.requiresAuth && !isAuthenticated.value) {
    return { path: "/auth" };
  }

  if (to.meta?.requiresAdmin && !isAdmin.value) {
    return { path: "/" };
  }

  return true;
});

export default router;
