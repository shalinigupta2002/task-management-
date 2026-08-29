import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { MOCK_API_DELAY } from "../constants/config";

const delay = (ms = MOCK_API_DELAY) => new Promise((r) => setTimeout(r, ms));

const mockAuth = {
  async login(email, password, role = "ADMIN") {
    if (email === "superadmin@taskflow.com") {
      try {
        const user = await apiAuth.login(email, password);
        localStorage.setItem(STORAGE_KEYS.isAuthenticated, "true");
        return user;
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data?.message || "Invalid credentials");
        }
        console.warn("Real Super Admin login failed due to network, falling back to mock", err);
      }
    }
    await delay();
    const user = {
      userId: "mock-user-1",
      name: email.split("@")[0],
      email,
      role: role || localStorage.getItem("userRole") || "ADMIN",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };
    if (!email || !password) throw { message: "Email and password are required" };
    localStorage.setItem(STORAGE_KEYS.accessToken, user.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, user.refreshToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.isAuthenticated, "true");
    return user;
  },

  async register(registerData) {
    await delay();
    return { success: true, message: "Registration successful", data: registerData };
  },

  async logout() {
    await delay();
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.isAuthenticated);
    return { success: true };
  },

  async refreshToken() {
    await delay();
    const token = "mock-access-token-refreshed";
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    return { accessToken: token };
  },

  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.accessToken) || localStorage.getItem(STORAGE_KEYS.isAuthenticated) === "true";
  },

  getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.user);
    return user ? JSON.parse(user) : null;
  },
};

const apiAuth = {
  login: async (email, password) => {
    try {
      const response = await api.post("/v1/auth/login", {
        email: String(email || "").trim().toLowerCase(),
        password,
      });
      if (response.data.success) {
        const data = response.data.data;
        const rawUser = data.user;
        const roleName = rawUser.role?.name || rawUser.role || "EMPLOYEE";
        const user = {
          ...rawUser,
          userId: rawUser.id,
          id: rawUser.id,
          name: `${rawUser.firstName || ""} ${rawUser.lastName || ""}`.trim(),
          email: rawUser.email,
          role: roleName,
          roleName,
          companyId: rawUser.companyId,
          departmentId: rawUser.departmentId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || null,
        };
        localStorage.setItem(STORAGE_KEYS.accessToken, user.accessToken);
        if (user.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.refreshToken, user.refreshToken);
        }
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.isAuthenticated, "true");
        localStorage.setItem("userRole", roleName);
        return user;
      }
      throw new Error(response.data.message || "Login failed");
    } catch (err) {
      const message =
        err?.response?.data?.message
        || err?.message
        || "Invalid credentials. Please check your email and password.";
      throw new Error(message);
    }
  },
  register: async (data) => (await api.post(ENDPOINTS.auth.register, data)).data,
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
      await api.post(ENDPOINTS.auth.logout, { refreshToken });
    } finally {
      await mockAuth.logout();
    }
  },
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    const response = await api.post(ENDPOINTS.auth.refresh, { refreshToken });
    if (response.data.success) {
      localStorage.setItem(STORAGE_KEYS.accessToken, response.data.data.accessToken);
      return response.data.data;
    }
    throw new Error(response.data.message);
  },
  isAuthenticated: mockAuth.isAuthenticated,
  getCurrentUser: mockAuth.getCurrentUser,
};

const authService = USE_MOCK_API ? mockAuth : apiAuth;

export default authService;
