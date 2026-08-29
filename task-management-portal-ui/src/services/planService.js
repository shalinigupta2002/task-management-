import api from "../api/axios";
import { USE_MOCK_API, MOCK_API_DELAY } from "../constants/config";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  toApiPlan,
  normalizePlan,
} from "../utils/planStorage";
import { notifyPlansUpdated } from "../utils/planEvents";

const delay = (ms = MOCK_API_DELAY) => new Promise((resolve) => setTimeout(resolve, ms));

function mapPayloadToStorage(data) {
  return normalizePlan({
    id: data.id,
    name: data.planName || data.name,
    description: data.description,
    monthlyPrice: data.monthlyPrice,
    yearlyPrice: data.yearlyPrice,
    currency: data.currency,
    users: data.maxEmployees ?? data.users,
    storage: data.storage,
    features: data.features,
    enabled: data.status ? data.status === "ACTIVE" : data.enabled,
    billingOptions: data.billingOptions,
  });
}

const mockPlanService = {
  getAll: async (params = {}) => {
    await delay();
    let plans = getPlans().map(toApiPlan);
    if (params.search) {
      const q = params.search.toLowerCase();
      plans = plans.filter((p) =>
        [p.planName, p.description, ...(p.features || [])]
          .some((v) => String(v ?? "").toLowerCase().includes(q))
      );
    }
    return { success: true, data: plans };
  },

  getById: async (id) => {
    await delay();
    const plan = getPlanById(id);
    if (!plan) throw { message: "Not found", status: 404 };
    return { success: true, data: toApiPlan(plan) };
  },

  create: async (data) => {
    await delay();
    const created = createPlan(mapPayloadToStorage(data));
    return { success: true, data: toApiPlan(created) };
  },

  update: async (id, data) => {
    await delay();
    const existing = getPlanById(id);
    if (!existing) throw { message: "Not found", status: 404 };

    const patch = {};
    if (data.planName != null || data.name != null) patch.name = data.planName || data.name;
    if (data.description != null) patch.description = data.description;
    if (data.monthlyPrice != null) patch.monthlyPrice = Number(data.monthlyPrice);
    if (data.yearlyPrice != null) patch.yearlyPrice = Number(data.yearlyPrice);
    if (data.currency != null) patch.currency = data.currency;
    if (data.maxEmployees != null || data.users != null) patch.users = data.maxEmployees ?? data.users;
    if (data.storage != null) patch.storage = data.storage;
    if (data.features != null) patch.features = data.features;
    if (data.billingOptions != null) patch.billingOptions = data.billingOptions;
    if (data.status != null) {
      patch.enabled = data.status === "ACTIVE";
      patch.status = data.status;
    }
    if (data.enabled != null) {
      patch.enabled = data.enabled;
      patch.status = data.enabled ? "ACTIVE" : "INACTIVE";
    }

    const updated = updatePlan(id, patch);
    return { success: true, data: toApiPlan(updated) };
  },

  delete: async (id) => {
    await delay();
    deletePlan(id);
    return { success: true, data: { id } };
  },
};

const apiPlanService = {
  getAll: async (params) => {
    const res = await api.get("/v1/subscription/plans", { params });
    return { success: true, data: res.data.data };
  },
  getById: async (id) => {
    const res = await api.get(`/v1/subscription/plans/${id}`);
    return { success: true, data: res.data.data };
  },
  create: async (data) => {
    const res = await api.post("/v1/subscription/plans", data);
    notifyPlansUpdated();
    return { success: true, data: res.data.data };
  },
  update: async (id, data) => {
    const res = await api.patch(`/v1/subscription/plans/${id}`, data);
    notifyPlansUpdated();
    return { success: true, data: res.data.data };
  },
  delete: async (id) => {
    const res = await api.delete(`/v1/subscription/plans/${id}`);
    notifyPlansUpdated();
    return { success: true, data: res.data.data };
  },
};

const planService = USE_MOCK_API ? mockPlanService : apiPlanService;

export default planService;
