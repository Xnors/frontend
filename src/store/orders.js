import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { orderAPI } from "@/api";

export const useOrderStore = defineStore("orders", () => {
  const orders = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 计算属性：总营业额
  const totalRevenue = computed(() => {
    return orders.value
      .filter(order => order.settled)
      .reduce((sum, order) => sum + order.price, 0);
  });

  // 计算属性：总收入（扣除平台分成）
  const totalIncome = computed(() => {
    return orders.value
      .filter(order => order.settled)
      .reduce((sum, order) => {
        const income = order.price * (1 - order.plat_share);
        return sum + income;
      }, 0);
  });

  // 计算属性：总分红（扣除工作室抽成）
  const totalDividend = computed(() => {
    return orders.value
      .filter(order => order.settled)
      .reduce((sum, order) => {
        const income = order.price * (1 - order.plat_share);
        const dividend = income * (1 - order.studio_share);
        return sum + dividend;
      }, 0);
  });

  // 计算属性：工作室保留收益（工作室入账 - 订单支出）
  const studioReserve = computed(() => {
    return orders.value
      .filter(order => order.settled)
      .reduce((sum, order) => {
        const income = order.price * (1 - order.plat_share);
        const studioShare = income * order.studio_share;
        return sum + studioShare - order.cost;
      }, 0);
  });

  // 获取所有订单
  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await orderAPI.getAll();
      if (res.status === "success") {
        orders.value = res.data || [];
      } else {
        error.value = res.message;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // 添加订单
  const addOrder = async (orderData) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await orderAPI.add(orderData);
      if (res.status === "success") {
        orders.value.push(res.data);
        return true;
      } else {
        error.value = res.message;
        return false;
      }
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 结算订单
  const settleOrder = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await orderAPI.settle(orderId);
      if (res.status === "success") {
        const index = orders.value.findIndex(order => order.id === orderId);
        if (index !== -1) {
          orders.value[index] = res.data;
        }
        return true;
      } else {
        error.value = res.message;
        return false;
      }
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 计算单个订单的收入
  const calculateOrderIncome = (order) => {
    return order.price * (1 - order.plat_share);
  };

  // 计算单个订单的分红
  const calculateOrderDividend = (order) => {
    const income = calculateOrderIncome(order);
    return income * (1 - order.studio_share);
  };

  // 计算单个订单的工作室抽成
  const calculateStudioShare = (order) => {
    const income = calculateOrderIncome(order);
    return income * order.studio_share;
  };

  // 计算成员的总贡献点
  const calculateMemberContributionPoints = (username) => {
    let totalPoints = 0;
    orders.value.forEach(order => {
      if (order.settled) {
        // 作为开发者的贡献点
        const developer = order.developers.find(dev => dev.name === username);
        if (developer) {
          totalPoints += order.price * Number(developer.contrib_ratio);
        }
        // 作为联络员的贡献点（报价的10%）
        if (order.connector === username) {
          totalPoints += order.price * 0.1;
        }
      }
    });
    return totalPoints;
  };

  // 计算成员从单个订单获得的分红
  const calculateMemberOrderDividend = (order, username) => {
    if (!order.settled) return 0;
    const developer = order.developers.find(dev => dev.name === username);
    if (!developer) return 0;
    const orderDividend = calculateOrderDividend(order);
    return orderDividend * Number(developer.contrib_ratio);
  };

  // 计算联络员从单个订单获得的贡献点
  const calculateConnectorContributionPoints = (order) => {
    if (!order.settled || !order.connector) return 0;
    return order.price * 0.1;
  };

  // 计算成员的总分红
  const calculateMemberTotalDividend = (username) => {
    let totalDividend = 0;
    orders.value.forEach(order => {
      if (order.settled) {
        totalDividend += calculateMemberOrderDividend(order, username);
      }
    });
    return totalDividend;
  };

  // 获取所有成员
  const getAllMembers = () => {
    const members = new Set();
    orders.value.forEach(order => {
      order.developers.forEach(dev => {
        members.add(dev.name);
      });
    });
    return Array.from(members);
  };

  return {
    orders,
    loading,
    error,
    totalRevenue,
    totalIncome,
    totalDividend,
    studioReserve,
    fetchOrders,
    addOrder,
    settleOrder,
    calculateOrderIncome,
    calculateOrderDividend,
    calculateStudioShare,
    calculateMemberContributionPoints,
    calculateMemberOrderDividend,
    calculateMemberTotalDividend,
    calculateConnectorContributionPoints,
    getAllMembers
  };
});
