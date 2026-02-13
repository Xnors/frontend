<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h2>工作室流水</h2>
      <div class="cash-flow-summary">
        <div class="summary-item">
          <span class="label">账上总额:</span>
          <span class="value">¥{{ studioReserve.toFixed(2) }}</span>
        </div>
      </div>

      <h3>各订单流水明细</h3>
      <div class="cash-flow-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="cash-flow-item"
        >
          <div class="order-info">
            <span class="order-id">订单 #{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.created_at) }}</span>
            <span class="order-note">{{ order.note }}</span>
          </div>
          <div class="flow-details">
            <div class="flow-item">
              <span class="label">报价:</span>
              <span class="value">¥{{ order.price.toFixed(2) }}</span>
            </div>
            <div class="flow-item">
              <span class="label">支出:</span>
              <span class="value expense">¥{{ order.cost.toFixed(2) }}</span>
            </div>
            <div class="flow-item">
              <span class="label">平台分成:</span>
              <span class="value">¥{{ (order.price * order.plat_share).toFixed(2) }}</span>
            </div>
            <div class="flow-item">
              <span class="label">工作室入账:</span>
              <span class="value income">¥{{ calculateOrderIncome(order).toFixed(2) }}</span>
            </div>
            <div class="flow-item">
              <span class="label">工作室抽成:</span>
              <span class="value income">¥{{ calculateStudioShare(order).toFixed(2) }}</span>
            </div>
            <div v-if="order.settled" class="flow-item">
              <span class="label">分红支出:</span>
              <span class="value expense">¥{{ calculateOrderDividend(order).toFixed(2) }}</span>
            </div>
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
  orders: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close']);

const studioReserve = computed(() => {
  return props.orders
    .filter(order => order.settled)
    .reduce((sum, order) => {
      const income = order.price * (1 - order.plat_share);
      const studioShare = income * order.studio_share;
      return sum + studioShare - order.cost;
    }, 0);
});

const calculateOrderIncome = (order) => {
  return order.price * (1 - order.plat_share);
};

const calculateStudioShare = (order) => {
  const income = calculateOrderIncome(order);
  return income * order.studio_share;
};

const calculateOrderDividend = (order) => {
  const income = calculateOrderIncome(order);
  return income * (1 - order.studio_share);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
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
  max-width: 800px;
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

.cash-flow-summary {
  padding: $spacing-xl;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border-radius: $radius-lg;
  margin-bottom: $spacing-xl;
  border: 2px solid rgba(16, 185, 129, 0.2);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: $font-size-xl;
}

.summary-item .label {
  color: $text-secondary;
  font-weight: 500;
}

.summary-item .value {
  color: $success-color;
  font-weight: 700;
  font-size: $font-size-3xl;
}

.cash-flow-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  max-height: 500px;
  overflow-y: auto;
  padding: $spacing-sm;
}

.cash-flow-item {
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  border: 1px solid $border-color;
  transition: $transition-base;

  &:hover {
    border-color: $primary-color;
    box-shadow: $shadow-md;
  }
}

.cash-flow-item .order-info {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $border-color;
}

.cash-flow-item .order-id {
  color: $text-primary;
  font-weight: 600;
  font-size: $font-size-lg;
}

.cash-flow-item .order-date {
  color: $text-secondary;
  font-size: $font-size-sm;
}

.cash-flow-item .order-note {
  color: $text-tertiary;
  font-size: $font-size-sm;
  flex: 1;
  text-align: right;
}

.flow-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.flow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm;
  background: $bg-secondary;
  border-radius: $radius-sm;
}

.flow-item .label {
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: 500;
}

.flow-item .value {
  font-weight: 600;
  font-size: $font-size-base;
}

.flow-item .value.income {
  color: $success-color;
}

.flow-item .value.expense {
  color: $danger-color;
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
