<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

const error = ref("");
const loading = ref(false);

const handleRegister = async () => {
  error.value = "";

  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = "两次输入的密码不一致";
    return;
  }

  if (formData.value.password.length < 6) {
    error.value = "密码长度至少为6位";
    return;
  }

  loading.value = true;
  try {
    await authStore.signup({
      username: formData.value.username,
      password: formData.value.password,
    });
    router.push("/#/login");
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Logo区域 -->
      <div class="auth-header">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0 0-2-2h-3a2 2 0 0 0 0-2 2v14a2 2 0 0 0 0 2 2h3a2 2 0 0 0 0 2-2z"></path>
          </svg>
        </div>
        <h1 class="auth-title">创建账号</h1>
        <p class="auth-subtitle">加入工作室订单管理系统</p>
      </div>

      <!-- 注册表单 -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0 0-4-4H8a4 4 0 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            用户名
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            密码
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="请输入密码（至少6位）"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            确认密码
          </label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            required
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
        </div>

        <div v-if="error" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ error }}
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <svg v-if="loading" class="loading-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          <span v-else>注册</span>
        </button>
      </form>

      <!-- 登录链接 -->
      <div class="auth-footer">
        已有账号？
        <router-link to="/login" class="link">
          立即登录
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: $spacing-lg;
}

.auth-card {
  background: $bg-primary;
  padding: $spacing-2xl;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.4s ease-out;
}

.auth-header {
  text-align: center;
  margin-bottom: $spacing-2xl;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto $spacing-lg;
  background: linear-gradient(135deg, $primary-color, $primary-hover);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: $shadow-md;

  svg {
    width: 48px;
    height: 48px;
  }
}

.auth-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.auth-subtitle {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: $text-primary;
  font-weight: 500;
  font-size: $font-size-base;

  svg {
    color: $text-tertiary;
  }
}

.form-group input {
  width: 100%;
  padding: $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: $font-size-base;
  transition: $transition-base;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &::placeholder {
    color: $text-tertiary;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: rgba($danger-color, 0.1);
  border: 1px solid rgba($danger-color, 0.2);
  border-radius: $radius-md;
  color: $danger-color;
  font-size: $font-size-sm;

  svg {
    flex-shrink: 0;
  }
}

.btn-submit {
  width: 100%;
  padding: $spacing-md;
  background: linear-gradient(135deg, $primary-color, $primary-hover);
  color: white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-lg;
  font-weight: 600;
  cursor: pointer;
  transition: $transition-base;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  box-shadow: $shadow-md;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  text-align: center;
  margin-top: $spacing-xl;
  color: $text-secondary;
  font-size: $font-size-base;
}

.link {
  color: $primary-color;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  transition: $transition-base;

  &:hover {
    text-decoration: underline;
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(4px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
