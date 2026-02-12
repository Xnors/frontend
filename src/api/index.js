import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 响应拦截器
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  signup: (data) => api.post("/auth/signup", data),
  whoami: () => api.get("/auth/whoami"),
  refresh: () => api.post("/auth/refresh"),
};

export const orderAPI = {
  getAll: () => api.get("/wst/orders"),
  add: (data) => api.post("/wst/orders/add", data),
  settle: (orderId) => api.post(`/wst/orders/settle?order_id=${orderId}`),
};
