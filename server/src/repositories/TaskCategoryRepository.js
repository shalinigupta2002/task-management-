import BaseRepository from "./BaseRepository.js";

class TaskCategoryRepository extends BaseRepository {
  constructor() {
    super("taskCategory", {
      searchFields: ["categoryName", "categoryCode", "description"],
      sortFields: ["categoryName", "categoryCode", "createdAt", "status"],
      defaultSort: "categoryName",
    });
  }

  async findAll(query) {
    const { companyId, ...rest } = query;
    const extra = companyId ? { companyId } : {};
    return super.findAll(rest, extra, {
      company: { select: { id: true, companyName: true, companyCode: true } },
      department: { select: { id: true, departmentName: true, departmentCode: true } },
      _count: { select: { tasks: true } },
    });
  }

  async findById(id) {
    return super.findById(id, {
      company: { select: { id: true, companyName: true } },
      department: { select: { id: true, departmentName: true, departmentCode: true } },
      _count: { select: { tasks: true } },
    });
  }

  async findByName(companyId, categoryName) {
    return this.client.findFirst({
      where: { companyId, categoryName, deletedAt: null },
    });
  }

  async findByCode(companyId, categoryCode) {
    return this.client.findFirst({
      where: { companyId, categoryCode, deletedAt: null },
    });
  }
}

export default new TaskCategoryRepository();
