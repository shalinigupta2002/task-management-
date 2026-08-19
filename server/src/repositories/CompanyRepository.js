import BaseRepository from "./BaseRepository.js";

const companyInclude = {
  _count: { select: { departments: true, users: true, subscriptions: true } },
  subscriptions: {
    where: { deletedAt: null },
    take: 1,
    orderBy: { createdAt: "desc" },
    include: { subscriptionPlan: true },
  },
};

class CompanyRepository extends BaseRepository {
  constructor() {
    super("company", {
      searchFields: ["companyName", "companyCode", "email", "city", "country", "industry"],
      sortFields: ["companyName", "companyCode", "createdAt", "updatedAt", "status"],
      defaultSort: "createdAt",
    });
  }

  async findAll(query) {
    const { industry, country, city, ...rest } = query;
    const extra = {};
    if (industry) extra.industry = { contains: industry, mode: "insensitive" };
    if (country) extra.country = { contains: country, mode: "insensitive" };
    if (city) extra.city = { contains: city, mode: "insensitive" };
    return super.findAll(rest, extra, companyInclude);
  }

  async findById(id) {
    return super.findById(id, {
      ...companyInclude,
      departments: { where: { deletedAt: null }, take: 10 },
    });
  }

  async findByCode(companyCode) {
    return this.client.findFirst({
      where: { companyCode, ...this.notDeleted() },
    });
  }

  async findByEmail(email) {
    return this.client.findFirst({
      where: { email, ...this.notDeleted() },
    });
  }
}

export default new CompanyRepository();
