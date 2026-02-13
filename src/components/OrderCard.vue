<template>
  <div class="order-card" :class="{ 'order-card--settled': order.settled }">
    <div class="order-card__header">
      <div class="order-card__status">
        <span class="badge" :class="statusBadgeClass">
          {{ order.settled ? '已结算' : '未结算' }}
        </span>
      </div>
      <div class="order-card__date">
        {{ formatDate(order.created_at) }}
      </div>
    </div>

    <div class="order-card__body">
      <div class="order-card__note">{{ order.note }}</div>

      <div v-if="order.settled" class="order-card__details">
        <div class="detail-item">
          <span class="detail-item__label">报价:</span>
          <span class="detail-item__value">¥{{ order.price.toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-item__label">收入:</span>
          <span class="detail-item__value">¥{{ calculateIncome.toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-item__label">分红:</span>
          <span class="detail-item__value">¥{{ calculateDividend.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="order-card__footer">
      <button class="btn btn-secondary" @click="handleViewDetails">
        查看详情
      </button>
      <button
        v-if="!order.settled"
        class="btn btn-primary"
        @click="handleSettle"
      >
        确认结算
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view-details', 'settle']);

const statusBadgeClass = computed(() => ({
  'badge-success': props.order.settled,
  'badge-warning': !props.order.settled
}));

const calculateIncome = computed(() => {
  return props.order.price * (1 - props.order.plat_share);
});

const calculateDividend = computed(() => {
  const income = calculateIncome.value;
  return income * (1 - props.order.studio_share);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const handleViewDetails = () => {
  emit('view-details', props.order);
};

const handleSettle = () => {
  emit('settle', props.order.id);
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.order-card {
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
  transition: $transition-base;
  border: 2px solid transparent;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

  &--settled {
    border-color: rgba($success-color, 0.2);
  }
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.order-card__status {
  flex: 1;
}

.order-card__date {
  color: $text-tertiary;
  font-size: $font-size-sm;
}

.order-card__body {
  margin-bottom: $spacing-lg;
}

.order-card__note {
  color: $text-primary;
  font-weight: 500;
  margin-bottom: $spacing-md;
  line-height: 1.6;
}

.order-card__details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.detail-item__label {
  color: $text-secondary;
  font-size: $font-size-sm;
}

.detail-item__value {
  color: $text-primary;
  font-weight: 600;
  font-size: $font-size-lg;
}

.order-card__footer {
  display: flex;
  gap: $spacing-sm;
}

.order-card__footer .btn {
  flex: 1;
}
</style>
