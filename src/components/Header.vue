<template>
  <header class="header">
    <div class="header-content">
      <h1 class="header-title">工作室订单管理系统</h1>
      <div class="user-info">
        <span class="username">{{ username }}</span>
        <button class="btn btn-secondary" @click="handleLogout">退出</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["logout"]);

const router = useRouter();

const handleLogout = () => {
  emit("logout");
  router.push("/login");
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.header {
  background-color: $bg-primary;
  box-shadow: $shadow-sm;
  padding: $spacing-lg $spacing-xl;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.username {
  color: $text-secondary;
  font-weight: 500;
}
</style>
