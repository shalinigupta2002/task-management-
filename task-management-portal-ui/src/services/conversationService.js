import api from "../api/axios";
import { unwrapData, unwrapList } from "../utils/session";

const BASE = "/v1/conversations";

const conversationService = {
  getAll: async (params) => unwrapList(await api.get(BASE, { params })),
  getById: async (id) => unwrapData(await api.get(`${BASE}/${id}`)),
  create: async (data) => unwrapData(await api.post(BASE, data)),
  /** Role-based Contact hierarchy recipients. Optional targetRole for Employee contact buttons. */
  getEligibleContacts: async (params) => unwrapData(await api.get(`${BASE}/contacts/eligible`, { params })),
};

export default conversationService;
