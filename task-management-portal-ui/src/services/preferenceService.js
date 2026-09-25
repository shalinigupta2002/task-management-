import api from "../api/axios";
import { unwrapData } from "../utils/session";

/**
 * User notification preferences — backed by GET/PATCH /v1/preferences.
 */
const preferenceService = {
  get: async () => unwrapData(await api.get("/v1/preferences")),
  update: async (data) => unwrapData(await api.patch("/v1/preferences", data)),
};

export default preferenceService;
