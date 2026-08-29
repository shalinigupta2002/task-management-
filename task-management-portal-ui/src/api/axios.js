import axios from "axios";
import { API_BASE_URL } from "../constants/config";

/**
 * Shared Axios instance for backend integration.
 * Replace API_BASE_URL in constants/config.js when connecting to a real API.
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
    const requestUrl = String(error.config?.url || "");
    // Failed login/register must surface the API error — do not wipe session or hard-redirect.
    const isAuthAttempt = /\/auth\/(login|register|forgot-password|reset-password)/i.test(requestUrl);

    if (status === 401 && !isAuthAttempt) {
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
