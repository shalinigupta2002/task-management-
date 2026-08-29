import { MOCK_API_DELAY } from "../constants/config";
import { STORAGE_KEYS } from "../constants/storageKeys";

const delay = (ms = MOCK_API_DELAY) => new Promise((resolve) => setTimeout(resolve, ms));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [...fallback];
  } catch {
    return [...fallback];
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Factory for Promise-based mock CRUD services.
 * Backend developers can replace each service file with real API calls.
 */
export default function createMockCrudService(storageKey, defaultData = [], idPrefix = "id") {
  const ensure = () => {
    const existing = localStorage.getItem(storageKey);
    if (!existing) save(storageKey, defaultData);
  };

  return {
    async getAll(params = {}) {
      await delay();
      ensure();
      let items = load(storageKey, defaultData);
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter((item) =>
          Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
        );
      }
      return { success: true, data: items };
    },

    async getById(id) {
      await delay();
      ensure();
      const item = load(storageKey, defaultData).find((i) => i.id === id);
      if (!item) throw { message: "Not found", status: 404 };
      return { success: true, data: item };
    },

    async create(payload) {
      await delay();
      ensure();
      const items = load(storageKey, defaultData);
      const item = { ...payload, id: payload.id || nextId(idPrefix), createdAt: payload.createdAt || new Date().toISOString() };
      items.unshift(item);
      save(storageKey, items);
      return { success: true, data: item };
    },

    async update(id, payload) {
      await delay();
      ensure();
      const items = load(storageKey, defaultData);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) throw { message: "Not found", status: 404 };
      items[idx] = { ...items[idx], ...payload, id };
      save(storageKey, items);
      return { success: true, data: items[idx] };
    },

    async delete(id) {
      await delay();
      ensure();
      const items = load(storageKey, defaultData).filter((i) => i.id !== id);
      save(storageKey, items);
      return { success: true, data: { id } };
    },
  };
}

/** Re-export storage key constants for service modules. */
export { STORAGE_KEYS };
