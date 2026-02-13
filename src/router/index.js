import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/store";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/LoginView.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("@/views/RegisterView.vue"),
      meta: { guest: true },
    },
    {
      path: "/",
      name: "Workstation",
      component: () => import("@/views/WorkstationView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 如果未登录，重定向到登录页
      next({ name: "Login" });
      return;
    }
  }
  
  // 检查是否是访客路由（登录/注册）
  if (to.meta.guest && authStore.isAuthenticated) {
    // 如果已登录，重定向到工作台
    next({ name: "Workstation" });
    return;
  }
  
  next();
});

export default router;

