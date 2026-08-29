import api from "../api/axios";
import { unwrapList } from "../utils/session";

const roleService = {
  getAll: async () => {
    const res = await api.get("/v1/role");
    return unwrapList(res);
  }
};

export default roleService;
