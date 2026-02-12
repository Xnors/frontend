<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
import { useOrderStore } from "@/store/orders";

const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();

// 添加订单表单
const showAddForm = ref(false);
const formData = ref({
  price: "",
  cost: 0,
  plat_share: 0.4,
  studio_share: 0.2,
  note: "",
  developers: [],
  connector: "",
});

// 开发者列表
const developers = ref([
  { name: "", contrib_ratio: 0 },
]);

// 显示详细信息
const showDetails = ref(false);
const selectedOrder = ref(null);

// 显示成员贡献点
const showMemberDetails = ref(false);

// 显示工作室流水
const showCashFlow = ref(false);

// 添加开发者
const addDeveloper = () => {
  developers.value.push({ username: "", contrib_ratio: 0 });
};

// 移除开发者
const removeDeveloper = (index) => {
  if (developers.value.length > 1) {
    developers.value.splice(index, 1);
  }
};

// 计算总贡献比例
const totalContribRatio = computed(() => {
  return developers.value.reduce((sum, dev) => sum + dev.contrib_ratio, 0);
});

// 提交订单
const handleSubmit = async () => {
  if (totalContribRatio.value !== 1) {
    alert("开发者贡献比例总和必须为100%");
    return;
  }

  const orderData = {
    ...formData.value,
    price: parseFloat(formData.value.price),
    cost: parseFloat(formData.value.cost),
    developers: developers.value,
  };

  const success = await orderStore.addOrder(orderData);
  if (success) {
    showAddForm.value = false;
    resetForm();
  }
};

// 重置表单
const resetForm = () => {
  formData.value = {
    price: "",
    cost: 0,
    plat_share: 0.4,
    studio_share: 0.2,
    note: "",
    developers: [],
    connector: "",
  };
  developers.value = [{ name: "", contrib_ratio: 0 }];
};

// 结算订单
const handleSettle = async (orderId) => {
  if (confirm("确定要结算此订单吗？")) {
    await orderStore.settleOrder(orderId);
  }
};

// 查看订单详情
const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  showDetails.value = true;
};

// 查看成员贡献点
const viewMemberDetails = () => {
  showMemberDetails.value = true;
};

// 查看工作室流水
const viewCashFlow = () => {
  showCashFlow.value = true;
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
    <!-- 顶部导航 -->
    <div class="header">
      <h1>工作室订单管理系统</h1>
      <div class="user-info">
        <span>{{ authStore.user?.username }}</span>
        <button @click="handleLogout">退出</button>
      </div>
    </div>

    <!-- 顶部数据卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">总营业额</div>
        <div class="stat-value">¥{{ orderStore.totalRevenue.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总收入</div>
        <div class="stat-value">¥{{ orderStore.totalIncome.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总分红</div>
        <div class="stat-value">¥{{ orderStore.totalDividend.toFixed(2) }}</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="btn-primary" @click="showAddForm = true">
        添加订单
      </button>
      <button class="btn-secondary" @click="viewMemberDetails">
        查看成员贡献点
      </button>
      <button class="btn-secondary" @click="viewCashFlow">
        查看工作室流水
      </button>
    </div>

    <!-- 订单列表 -->
    <div class="orders-section">
      <h2>订单列表</h2>
      <div class="orders-grid">
        <div
          v-for="order in orderStore.orders"
          :key="order.id"
          class="order-card"
          :class="{ settled: order.settled }"
        >
          <div class="order-header">
            <div class="order-status">
              <span :class="order.settled ? 'settled-badge' : 'pending-badge'">
                {{ order.settled ? '已结算' : '未结算' }}
              </span>
            </div>
            <div class="order-date">
              {{ new Date(order.created_at).toLocaleDateString() }}
            </div>
          </div>

          <div class="order-body">
            <div class="order-note">{{ order.note }}</div>

            <div v-if="order.settled" class="order-details">
              <div class="detail-item">
                <span class="label">报价:</span>
                <span class="value">¥{{ order.price.toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">收入:</span>
                <span class="value">¥{{ orderStore.calculateOrderIncome(order).toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">分红:</span>
                <span class="value">¥{{ orderStore.calculateOrderDividend(order).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <button class="btn-view" @click="viewOrderDetails(order)">
              查看详情
            </button>
            <button
              v-if="!order.settled"
              class="btn-settle"
              @click="handleSettle(order.id)"
            >
              确认结算
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加订单表单 -->
    <div v-if="showAddForm" class="modal-overlay" @click.self="showAddForm = false">
      <div class="modal-content">
        <h2>添加订单</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>报价</label>
            <input
              v-model.number="formData.price"
              type="number"
              step="0.01"
              required
              placeholder="请输入报价"
            />
          </div>

          <div class="form-group">
            <label>支出</label>
            <input
              v-model.number="formData.cost"
              type="number"
              step="0.01"
              required
              placeholder="请输入支出"
            />
          </div>

          <div class="form-group">
            <label>平台分成 ({{ (formData.plat_share * 100).toFixed(0) }}%)</label>
            <input
              v-model.number="formData.plat_share"
              type="number"
              step="0.01"
              min="0"
              max="1"
              required
            />
          </div>

          <div class="form-group">
            <label>工作室抽成 ({{ (formData.studio_share * 100).toFixed(0) }}%)</label>
            <input
              v-model.number="formData.studio_share"
              type="number"
              step="0.01"
              min="0"
              max="1"
              required
            />
          </div>

          <div class="form-group">
            <label>联络员</label>
            <input
              v-model="formData.connector"
              type="text"
              required
              placeholder="请输入联络员用户名"
            />
          </div>

          <div class="form-group">
            <label>备注</label>
            <textarea
              v-model="formData.note"
              required
              placeholder="请输入备注"
            ></textarea>
          </div>

          <div class="developers-section">
            <h3>开发者贡献</h3>
            <div
              v-for="(dev, index) in developers"
              :key="index"
              class="developer-row"
            >
              <input
                v-model="dev.name"
                type="text"
                required
                placeholder="用户名"
              />
              <input
                v-model.number="dev.contrib_ratio"
                type="number"
                step="0.01"
                min="0"
                max="1"
                required
                placeholder="贡献比例"
              />
              <button
                v-if="developers.length > 1"
                type="button"
                class="btn-remove"
                @click="removeDeveloper(index)"
              >
                移除
              </button>
            </div>
            <button type="button" class="btn-add" @click="addDeveloper">
              添加开发者
            </button>
            <div class="total-ratio">
              总贡献比例: {{ (totalContribRatio * 100).toFixed(0) }}%
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="showAddForm = false">
              取消
            </button>
            <button type="submit" class="btn-submit">提交</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 订单详情 -->
    <div v-if="showDetails && selectedOrder" class="modal-overlay" @click.self="showDetails = false">
      <div class="modal-content">
        <h2>订单详情</h2>
        <div class="order-detail-info">
          <div class="detail-row">
            <span class="label">订单ID:</span>
            <span class="value">{{ selectedOrder.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">创建时间:</span>
            <span class="value">{{ new Date(selectedOrder.created_at).toLocaleString() }}</span>
          </div>
          <div class="detail-row">
            <span class="label">报价:</span>
            <span class="value">¥{{ selectedOrder.price.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">支出:</span>
            <span class="value">¥{{ selectedOrder.cost.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">平台分成:</span>
            <span class="value">{{ (selectedOrder.plat_share * 100).toFixed(0) }}%</span>
          </div>
          <div class="detail-row">
            <span class="label">工作室抽成:</span>
            <span class="value">{{ (selectedOrder.studio_share * 100).toFixed(0) }}%</span>
          </div>
          <div v-if="selectedOrder.settled" class="detail-row">
            <span class="label">收入:</span>
            <span class="value">¥{{ orderStore.calculateOrderIncome(selectedOrder).toFixed(2) }}</span>
          </div>
          <div v-if="selectedOrder.settled" class="detail-row">
            <span class="label">分红:</span>
            <span class="value">¥{{ orderStore.calculateOrderDividend(selectedOrder).toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">状态:</span>
            <span :class="selectedOrder.settled ? 'settled-badge' : 'pending-badge'">
              {{ selectedOrder.settled ? '已结算' : '未结算' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="label">备注:</span>
            <span class="value">{{ selectedOrder.note }}</span>
          </div>
          <div class="detail-row">
            <span class="label">联络员:</span>
            <span class="value">{{ selectedOrder.connector }}</span>
          </div>

          <h3>开发者列表</h3>
          <div class="developers-list">
            <div
              v-for="dev in selectedOrder.developers"
              :key="dev.name"
              class="developer-item"
            >
              <span class="dev-name">{{ dev.name }}</span>
              <span class="dev-ratio">{{ (Number(dev.contrib_ratio) * 100).toFixed(0) }}%</span>
              <span v-if="selectedOrder.settled" class="dev-dividend">
                分红: ¥{{ orderStore.calculateMemberOrderDividend(selectedOrder, dev.name).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
        <button class="btn-close" @click="showDetails = false">关闭</button>
      </div>
    </div>

    <!-- 成员贡献点详情 -->
    <div v-if="showMemberDetails" class="modal-overlay" @click.self="showMemberDetails = false">
      <div class="modal-content">
        <h2>成员贡献点详情</h2>
        <div class="members-details">
          <div
            v-for="member in orderStore.getAllMembers()"
            :key="member"
            class="member-card"
          >
            <h3>{{ member }}</h3>
            <div class="member-stats">
              <div class="stat-item">
                <span class="label">总贡献点:</span>
                <span class="value">{{ orderStore.calculateMemberContributionPoints(member).toFixed(2) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">总分红:</span>
                <span class="value">¥{{ orderStore.calculateMemberTotalDividend(member).toFixed(2) }}</span>
              </div>
            </div>

            <h4>各订单贡献明细</h4>
            <div class="order-contributions">
              <div
                v-for="order in orderStore.orders.filter(o => o.settled)"
                :key="order.id"
                class="order-contribution-item"
              >
                <div class="order-info">
                  <span class="order-id">订单 #{{ order.id }}</span>
                  <span class="order-date">{{ new Date(order.created_at).toLocaleDateString() }}</span>
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
                v-for="order in orderStore.orders.filter(o => o.settled && o.developers.some(d => d.username === member))"
                :key="order.id"
                class="order-dividend-item"
              >
                <div class="order-info">
                  <span class="order-id">订单 #{{ order.id }}</span>
                  <span class="order-date">{{ new Date(order.created_at).toLocaleDateString() }}</span>
                </div>
                <div class="dividend-amount">
                  ¥{{ orderStore.calculateMemberOrderDividend(order, member).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-close" @click="showMemberDetails = false">关闭</button>
      </div>
    </div>

    <!-- 工作室流水详情 -->
    <div v-if="showCashFlow" class="modal-overlay" @click.self="showCashFlow = false">
      <div class="modal-content">
        <h2>工作室流水</h2>
        <div class="cash-flow-summary">
          <div class="summary-item">
            <span class="label">账上总额:</span>
            <span class="value">¥{{ orderStore.studioReserve.toFixed(2) }}</span>
          </div>
        </div>

        <h3>各订单流水明细</h3>
        <div class="cash-flow-list">
          <div
            v-for="order in orderStore.orders"
            :key="order.id"
            class="cash-flow-item"
          >
            <div class="order-info">
              <span class="order-id">订单 #{{ order.id }}</span>
              <span class="order-date">{{ new Date(order.created_at).toLocaleDateString() }}</span>
              <span class="order-note">{{ order.note }}</span>
            </div>
            <div class="flow-details">
              <div class="flow-item">
                <span class="label">报价:</span>
                <span class="value">¥{{ order.price.toFixed(2) }}</span>
              </div>
              <div class="flow-item">
                <span class="label">支出:</span>
                <span class="value">¥{{ order.cost.toFixed(2) }}</span>
              </div>
              <div class="flow-item">
                <span class="label">平台分成:</span>
                <span class="value">¥{{ (order.price * order.plat_share).toFixed(2) }}</span>
              </div>
              <div class="flow-item">
                <span class="label">工作室入账:</span>
                <span class="value income">¥{{ orderStore.calculateOrderIncome(order).toFixed(2) }}</span>
              </div>
              <div class="flow-item">
                <span class="label">工作室抽成:</span>
                <span class="value income">¥{{ orderStore.calculateStudioShare(order).toFixed(2) }}</span>
              </div>
              <div v-if="order.settled" class="flow-item">
                <span class="label">分红支出:</span>
                <span class="value expense">¥{{ orderStore.calculateOrderDividend(order).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-close" @click="showCashFlow = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workstation {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: #666;
}

.user-info button {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.user-info button:hover {
  background: #dc2626;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.orders-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.orders-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.order-card.settled {
  border-color: #10b981;
  background: #f0fdf4;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.settled-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #10b981;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.pending-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #f59e0b;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.order-date {
  color: #666;
  font-size: 12px;
}

.order-body {
  margin-bottom: 16px;
}

.order-note {
  color: #333;
  font-weight: 500;
  margin-bottom: 12px;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-item .label {
  color: #666;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.order-footer {
  display: flex;
  gap: 10px;
}

.btn-view,
.btn-settle {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view {
  background: #667eea;
  color: white;
}

.btn-view:hover {
  background: #5568d3;
}

.btn-settle {
  background: #10b981;
  color: white;
}

.btn-settle:hover {
  background: #059669;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.developers-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.developers-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.developer-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.developer-row input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.btn-add,
.btn-remove {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add {
  background: #667eea;
  color: white;
}

.btn-add:hover {
  background: #5568d3;
}

.btn-remove {
  background: #ef4444;
  color: white;
}

.btn-remove:hover {
  background: #dc2626;
}

.total-ratio {
  margin-top: 10px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit,
.btn-close {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #e5e7eb;
  color: #333;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-submit,
.btn-close {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover,
.btn-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.order-detail-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
}

.detail-row .label {
  color: #666;
  font-size: 14px;
}

.detail-row .value {
  color: #333;
  font-weight: 500;
}

.developers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.developer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.dev-name {
  color: #333;
  font-weight: 500;
}

.dev-ratio {
  color: #667eea;
}

.dev-dividend {
  color: #10b981;
  font-weight: 500;
}

.members-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.member-card {
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.member-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.member-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item .label {
  color: #666;
  font-size: 14px;
}

.stat-item .value {
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.member-card h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.order-contributions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.order-contribution-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.order-contribution-item .order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-contribution-item .order-id {
  color: #333;
  font-weight: 500;
}

.order-contribution-item .order-date {
  color: #666;
  font-size: 12px;
}

.contribution-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dev-contrib {
  color: #667eea;
  font-size: 14px;
}

.connector-contrib {
  color: #10b981;
  font-size: 14px;
}

.order-dividends {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-dividend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id {
  color: #333;
  font-weight: 500;
}

.order-date {
  color: #666;
  font-size: 12px;
}

.dividend-amount {
  color: #10b981;
  font-weight: 600;
  font-size: 16px;
}

/* 工作室流水样式 */
.cash-flow-summary {
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.cash-flow-summary .summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
}

.cash-flow-summary .label {
  color: #666;
  font-weight: 500;
}

.cash-flow-summary .value {
  color: #10b981;
  font-weight: 700;
  font-size: 24px;
}

.cash-flow-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;
}

.cash-flow-item {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.cash-flow-item .order-info {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.cash-flow-item .order-id {
  color: #333;
  font-weight: 600;
}

.cash-flow-item .order-date {
  color: #666;
  font-size: 14px;
}

.cash-flow-item .order-note {
  color: #999;
  font-size: 14px;
  flex: 1;
  text-align: right;
}

.flow-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.flow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flow-item .label {
  color: #666;
  font-size: 14px;
}

.flow-item .value {
  font-weight: 600;
  font-size: 15px;
}

.flow-item .value.income {
  color: #10b981;
}

.flow-item .value.expense {
  color: #ef4444;
}
</style>
