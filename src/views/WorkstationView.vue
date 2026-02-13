<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
import { useOrderStore } from "@/store/orders";
import Header from "@/components/Header.vue";
import StatsCard from "@/components/StatsCard.vue";
import OrderCard from "@/components/OrderCard.vue";
import AddOrderModal from "@/components/AddOrderModal.vue";
import OrderDetailsModal from "@/components/OrderDetailsModal.vue";
import MemberDetailsModal from "@/components/MemberDetailsModal.vue";
import CashFlowModal from "@/components/CashFlowModal.vue";

const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();

// 添加订单表单
const showAddForm = ref(false);

// 显示详细信息
const showDetails = ref(false);
const selectedOrder = ref(null);

// 显示成员贡献点
const showMemberDetails = ref(false);

// 显示工作室流水
const showCashFlow = ref(false);

// 提交订单
const handleSubmit = async (orderData) => {
  const success = await orderStore.addOrder(orderData);
  if (success) {
    showAddForm.value = false;
  }
};

// 结算订单
const handleSettle = async (orderId) => {
  if (confirm("确定要结算此订单吗？")) {
    await orderStore.settleOrder(orderId);
  }
};

// 查看订单详情
const handleViewDetails = (order) => {
  selectedOrder.value = order;
  showDetails.value = true;
};

// 退出登录
const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

// 页面加载时获取订单数据
onMounted(() => {
  orderStore.fetchOrders();
});
</script>

<template>
  <div class="workstation">
    <Header 
      :username="authStore.user?.username" 
      @logout="handleLogout"
    />

    <div class="workstation-content">
      <!-- 顶部数据卡片 -->
      <div class="stats-cards">
        <StatsCard
          label="总营业额"
          :value="orderStore.totalRevenue"
          variant="primary"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </template>
        </StatsCard>
        <StatsCard
          label="总收入"
          :value="orderStore.totalIncome"
          variant="success"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </template>
        </StatsCard>
        <StatsCard
          label="总分红"
          :value="orderStore.totalDividend"
          variant="info"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </template>
        </StatsCard>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-primary" @click="showAddForm = true">
          添加订单
        </button>
        <button class="btn btn-secondary" @click="showMemberDetails = true">
          查看成员贡献点
        </button>
        <button class="btn btn-secondary" @click="showCashFlow = true">
          查看工作室流水
        </button>
      </div>

      <!-- 订单列表 -->
      <div class="orders-section">
        <h2>订单列表</h2>
        <div class="orders-grid">
          <OrderCard
            v-for="order in orderStore.orders"
            :key="order.id"
            :order="order"
            @view-details="handleViewDetails"
            @settle="handleSettle"
          />
        </div>
      </div>
    </div>

    <!-- 添加订单表单 -->
    <AddOrderModal
      :show="showAddForm"
      @close="showAddForm = false"
      @submit="handleSubmit"
    />

    <!-- 订单详情 -->
    <OrderDetailsModal
      :show="showDetails"
      :order="selectedOrder"
      @close="showDetails = false"
    />

    <!-- 成员贡献点详情 -->
    <MemberDetailsModal
      :show="showMemberDetails"
      :orders="orderStore.orders"
      @close="showMemberDetails = false"
    />

    <!-- 工作室流水详情 -->
    <CashFlowModal
      :show="showCashFlow"
      :orders="orderStore.orders"
      @close="showCashFlow = false"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.workstation {
  min-height: 100vh;
  background: $bg-secondary;
}

.workstation-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: $spacing-xl;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.action-buttons {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  flex-wrap: wrap;
}

.action-buttons .btn {
  flex: 0 0 auto;
}

.orders-section {
  h2 {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-lg;
  }
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-lg;
}
</style>
