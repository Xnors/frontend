import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI } from "@/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));
  const isAuthenticated = computed(() => !!user.value);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    if (res.status === "success") {
      user.value = res.data;
      localStorage.setItem("user", JSON.stringify(res.data));
      return true;
    }
    throw new Error(res.message);
  };

  const signup = async (data) => {
    const res = await authAPI.signup(data);
    if (res.status === "success") return true;
    throw new Error(res.message);
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem("user");
  };

  const checkAuth = async () => {
    try {
      const res = await authAPI.whoami();
      if (res.status === "success" && res.data) {
        user.value = res.data;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return { user, isAuthenticated, login, signup, logout, checkAuth };
});
