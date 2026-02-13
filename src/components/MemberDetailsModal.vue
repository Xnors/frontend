<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h2>成员贡献点详情</h2>
      <div class="members-details">
        <div
          v-for="member in members"
          :key="member"
          class="member-card"
        >
          <h3>{{ member }}</h3>
          <div class="member-stats">
            <div class="stat-item">
              <span class="label">总贡献点:</span>
              <span class="value">{{ calculateContributionPoints(member).toFixed(2) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">总分红:</span>
              <span class="value">¥{{ calculateTotalDividend(member).toFixed(2) }}</span>
            </div>
          </div>

          <h4>各订单贡献明细</h4>
          <div class="order-contributions">
            <div
              v-for="order in settledOrders"
              :key="order.id"
              class="order-contribution-item"
            >
              <div class="order-info">
                <span class="order-id">订单 #{{ order.id }}</span>
                <span class="order-date">{{ formatDate(order.created_at) }}</span>
              </div>
              <div class="contribution-details">
                <div v-if="order.developers.some(d => d.name === member)" class="dev-contrib">
                  开发者贡献: {{ (order.price * Number(order.developers.find(d => d.name === member).contrib_ratio)).toFixed(2) }}
                </div>
                <div v-if="order.connector === member" class="connector-contrib">
                  联络员贡献: {{ (order.price * 0.1).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <h4>各订单分红明细</h4>
          <div class="order-dividends">
            <div
              v-for="order in settledOrders.filter(o => o.developers.some(d => d.name === member))"
              :key="order.id"
              class="order-dividend-item"
            >
              <div class="order-info">
                <span class="order-id">订单 #{{ order.id }}</span>
                <span class="order-date">{{ formatDate(order.created_at) }}</span>
              </div>
              <div class="dividend-amount">
                ¥{{ calculateMemberOrderDividend(order, member).toFixed(2) }}
              </div>
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

const members = computed(() => {
  const memberSet = new Set();
  props.orders.forEach(order => {
    // 添加开发者
    order.developers.forEach(dev => {
      memberSet.add(dev.name);
    });
    // 添加联络员
    if (order.connector) {
      memberSet.add(order.connector);
    }
  });
  return Array.from(memberSet);
});

const settledOrders = computed(() => {
  return props.orders.filter(order => order.settled);
});

const calculateContributionPoints = (username) => {
  let totalPoints = 0;
  props.orders.forEach(order => {
    if (order.settled) {
      const developer = order.developers.find(dev => dev.name === username);
      if (developer) {
        totalPoints += order.price * Number(developer.contrib_ratio);
      }
      if (order.connector === username) {
        totalPoints += order.price * 0.1;
      }
    }
  });
  return totalPoints;
};

const calculateTotalDividend = (username) => {
  let totalDividend = 0;
  props.orders.forEach(order => {
    if (order.settled) {
      totalDividend += calculateMemberOrderDividend(order, username);
    }
  });
  return totalDividend;
};

const calculateMemberOrderDividend = (order, username) => {
  if (!order.settled) return 0;
  const developer = order.developers.find(dev => dev.name === username);
  if (!developer) return 0;
  const income = order.price * (1 - order.plat_share);
  const dividend = income * (1 - order.studio_share);
  return dividend * Number(developer.contrib_ratio);
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

  h4 {
    margin: $spacing-md 0 $spacing-sm;
    font-size: $font-size-lg;
    color: $text-secondary;
  }
}

.members-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  margin-bottom: $spacing-xl;
}

.member-card {
  background: $bg-secondary;
  border-radius: $radius-lg;
  padding: $spacing-lg;
}

.member-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: $bg-primary;
  border-radius: $radius-md;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item .label {
  color: $text-secondary;
  font-weight: 500;
}

.stat-item .value {
  color: $text-primary;
  font-weight: 700;
  font-size: $font-size-xl;
}

.order-contributions,
.order-dividends {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.order-contribution-item,
.order-dividend-item {
  padding: $spacing-md;
  background: $bg-primary;
  border-radius: $radius-md;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border-color;
}

.order-id {
  color: $text-primary;
  font-weight: 600;
}

.order-date {
  color: $text-tertiary;
  font-size: $font-size-sm;
}

.contribution-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.dev-contrib,
.connector-contrib {
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
}

.dev-contrib {
  background: rgba($primary-color, 0.1);
  color: $primary-color;
}

.connector-contrib {
  background: rgba($success-color, 0.1);
  color: $success-color;
}

.dividend-amount {
  color: $success-color;
  font-weight: 600;
  font-size: $font-size-lg;
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
