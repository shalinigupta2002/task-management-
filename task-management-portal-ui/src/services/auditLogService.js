import api from "../api/axios";
import { unwrapList } from "../utils/session";

const auditLogService = {
  getAll: async (params) => {
    const res = await api.get("/v1/audit-logs", { params });
    // Handle both wrapped and unwrapped array responses
    return res.data?.data || res.data || [];
  },
};

export default auditLogService;
