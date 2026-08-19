import BaseRepository from "./BaseRepository.js";

const departmentInclude = {
  company: { select: { id: true, companyName: true, companyCode: true } },
  _count: { select: { users: true } },
  users: {
    where: { deletedAt: null },
    select: {
      firstName: true,
      lastName: true,
      designation: true,
      role: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  },
};

class DepartmentRepository extends BaseRepository {
  constructor() {
    super("department", {
      searchFields: ["departmentName", "departmentCode", "description"],
      sortFields: ["departmentName", "departmentCode", "createdAt", "status"],
      defaultSort: "createdAt",
    });
  }

  async findAll(query) {
    const { companyId, ...rest } = query;
    const extra = {};
    if (companyId) extra.companyId = companyId;
    return super.findAll(rest, extra, departmentInclude);
  }

  async findById(id) {
    return super.findById(id, {
      ...departmentInclude,
      users: {
        where: { deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          designation: true,
          status: true,
          role: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      },
    });
  }

  async findByCode(companyId, departmentCode) {
    return this.client.findFirst({
      where: { companyId, departmentCode, ...this.notDeleted() },
    });
  }
}

export default new DepartmentRepository();
