import AuditLogRepository from "../repositories/AuditLogRepository.js";
import ApiError from "../utils/ApiError.js";

class AuditLogService {
  async getAll(query, userContext) {
    const q = { ...query };
    if (userContext.role !== "SUPER_ADMIN") {
      q.companyId = userContext.companyId;
    }
    return AuditLogRepository.findAll(q);
  }

  async create(data) {
    return AuditLogRepository.create(data);
  }
}

export default new AuditLogService();
