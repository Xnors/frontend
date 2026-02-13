<template>
  <div v-if="show && order" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h2>订单详情</h2>
      <div class="order-detail-info">
        <div class="detail-row">
          <span class="label">订单ID:</span>
          <span class="value">{{ order.id }}</span>
        </div>
        <div class="detail-row">
          <span class="label">创建时间:</span>
          <span class="value">{{ formatDate(order.created_at) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">报价:</span>
          <span class="value">¥{{ order.price.toFixed(2) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">支出:</span>
          <span class="value">¥{{ order.cost.toFixed(2) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">平台分成:</span>
          <span class="value">{{ (order.plat_share * 100).toFixed(0) }}%</span>
        </div>
        <div class="detail-row">
          <span class="label">工作室抽成:</span>
          <span class="value">{{ (order.studio_share * 100).toFixed(0) }}%</span>
        </div>
        <div v-if="order.settled" class="detail-row">
          <span class="label">收入:</span>
          <span class="value">¥{{ calculateIncome.toFixed(2) }}</span>
        </div>
        <div v-if="order.settled" class="detail-row">
          <span class="label">分红:</span>
          <span class="value">¥{{ calculateDividend.toFixed(2) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">状态:</span>
          <span class="badge" :class="statusBadgeClass">
            {{ order.settled ? '已结算' : '未结算' }}
          </span>
        </div>
        <div class="detail-row">
          <span class="label">备注:</span>
          <span class="value">{{ order.note }}</span>
        </div>
        <div class="detail-row">
          <span class="label">联络员:</span>
          <span class="value">{{ order.connector }}</span>
        </div>

        <h3>开发者列表</h3>
        <div class="developers-list">
          <div
            v-for="dev in order.developers"
            :key="dev.name"
            class="developer-item"
          >
            <span class="dev-name">{{ dev.name }}</span>
            <span class="dev-ratio">{{ (Number(dev.contrib_ratio) * 100).toFixed(0) }}%</span>
            <span v-if="order.settled" class="dev-dividend">
              分红: ¥{{ calculateMemberDividend(dev.name).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
      <button class="btn btn-secondary" @click="handleClose">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  order: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const statusBadgeClass = computed(() => ({
  'badge-success': props.order?.settled,
  'badge-warning': !props.order?.settled
}));

const calculateIncome = computed(() => {
  if (!props.order) return 0;
  return props.order.price * (1 - props.order.plat_share);
});

const calculateDividend = computed(() => {
  if (!props.order) return 0;
  const income = calculateIncome.value;
  return income * (1 - props.order.studio_share);
});

const calculateMemberDividend = (memberName) => {
  if (!props.order || !props.order.settled) return 0;
  const developer = props.order.developers.find(dev => dev.name === memberName);
  if (!developer) return 0;
  return calculateDividend.value * Number(developer.contrib_ratio);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const handleClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $spacing-lg;
  animation: fadeIn 0.2s ease-in-out;
}

.modal-content {
  background-color: $bg-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  padding: $spacing-xl;

  h2 {
    margin-bottom: $spacing-lg;
    font-size: $font-size-2xl;
    color: $text-primary;
  }

  h3 {
    margin: $spacing-lg 0 $spacing-md;
    font-size: $font-size-xl;
    color: $text-primary;
  }
}

.order-detail-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.detail-row .label {
  color: $text-secondary;
  font-weight: 500;
}

.detail-row .value {
  color: $text-primary;
  font-weight: 600;
}

.developers-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.developer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
}

.dev-name {
  font-weight: 600;
  color: $text-primary;
}

.dev-ratio {
  color: $text-secondary;
  font-size: $font-size-sm;
}

.dev-dividend {
  color: $success-color;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
