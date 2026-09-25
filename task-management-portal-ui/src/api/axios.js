import axios from "axios";
import { API_BASE_URL } from "../constants/config";

/**
 * Shared Axios instance for backend integration.
 * baseURL comes from VITE_API_BASE_URL (see constants/config.js).
 * Endpoints are relative paths like `/v1/auth/login` → `${API_BASE_URL}/v1/auth/login`.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.params && typeof config.params === "object") {
    if ("limit" in config.params) {
      const parsedLimit = Number(config.params.limit);
      config.params.limit = isNaN(parsedLimit)
        ? 10
        : Math.min(Math.max(1, parsedLimit), 100);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;
    const requestUrl = String(original?.url || "");
    const isAuthAttempt = /\/auth\/(login|register|forgot-password|reset-password|refresh)/i.test(requestUrl);

    if (status === 401 && !isAuthAttempt && original && !original._retry) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        original._retry = true;
        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, { refreshToken });
          const data = refreshRes?.data?.data || refreshRes?.data;
          if (data?.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
          }
        } catch {
          /* fall through to logout */
        }
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
