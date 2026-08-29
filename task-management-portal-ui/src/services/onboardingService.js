import api from "../api/axios";
import { unwrapData } from "../utils/session";

const BASE = "/v1/onboarding";

const SESSION_KEY = "tf_onboarding_session";

export function saveOnboardingSession({ referenceCode, sessionToken }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ referenceCode, sessionToken }));
}

export function loadOnboardingSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearOnboardingSession() {
  localStorage.removeItem(SESSION_KEY);
}

const onboardingService = {
  listPlans: async () => unwrapData(await api.get(`${BASE}/plans`)),
  createCheckout: async (data) => unwrapData(await api.post(`${BASE}/checkout`, data)),
  getSession: async (params) => unwrapData(await api.get(`${BASE}/session`, { params })),
  verifyPayment: async (data) => unwrapData(await api.post(`${BASE}/payment/verify`, data)),
  simulatePayment: async (data) => unwrapData(await api.post(`${BASE}/payment/simulate`, data)),
  failPayment: async (data) => unwrapData(await api.post(`${BASE}/payment/fail`, data)),
  complete: async (data) => unwrapData(await api.post(`${BASE}/complete`, data)),
};

export default onboardingService;
