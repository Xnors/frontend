<template>
  <div class="stats-card">
    <div class="stats-icon" :class="iconClass">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </slot>
    </div>
    <div class="stats-content">
      <div class="stats-label">{{ label }}</div>
      <div class="stats-value">¥{{ value.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  }
});

const iconClass = computed(() => `stats-icon--${props.variant}`);
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.stats-card {
  background: $bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  &--primary {
    background: linear-gradient(135deg, $primary-color, $primary-hover);
  }

  &--success {
    background: linear-gradient(135deg, $success-color, darken($success-color, 10%));
  }

  &--warning {
    background: linear-gradient(135deg, $warning-color, darken($warning-color, 10%));
  }

  &--danger {
    background: linear-gradient(135deg, $danger-color, darken($danger-color, 10%));
  }

  &--info {
    background: linear-gradient(135deg, $info-color, darken($info-color, 10%));
  }
}

.stats-content {
  flex: 1;
}

.stats-label {
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: 500;
  margin-bottom: $spacing-xs;
}

.stats-value {
  color: $text-primary;
  font-size: $font-size-2xl;
  font-weight: 700;
}
</style>
