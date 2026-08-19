import prisma from "../config/database.js";
import BaseRepository from "./BaseRepository.js";
import { handlePrismaError } from "../utils/prismaError.js";
import {
  parsePagination,
  buildPaginationMeta,
  parseSort,
} from "../utils/pagination.js";

const planInclude = {
  _count: { select: { subscriptions: true } },
};

const subscriptionInclude = {
  company: { select: { id: true, companyName: true, companyCode: true } },
  subscriptionPlan: true,
};

class SubscriptionRepository extends BaseRepository {
  constructor() {
    super("subscriptionPlan", {
      searchFields: ["planName", "description"],
      sortFields: ["planName", "monthlyPrice", "createdAt", "status"],
      defaultSort: "planName",
    });
  }

  async findAllPlans(query) {
    return super.findAll(query, {}, planInclude);
  }

  async findPlanById(id) {
    return super.findById(id, {
      ...planInclude,
      subscriptions: {
        where: { deletedAt: null },
        take: 10,
        include: { company: { select: { id: true, companyName: true } } },
      },
    });
  }

  async findPlanByName(planName) {
    return this.client.findFirst({
      where: { planName, ...this.notDeleted() },
    });
  }

  async createPlan(data) {
    return super.create(data);
  }

  async updatePlan(id, data) {
    return super.update(id, data);
  }

  async softDeletePlan(id) {
    return super.softDelete(id);
  }

  async findAllSubscriptions(query) {
    const { page, limit, skip } = parsePagination(query);
    const where = { deletedAt: null };
    if (query.companyId) where.companyId = query.companyId;
    if (query.subscriptionPlanId) where.subscriptionPlanId = query.subscriptionPlanId;
    if (query.subscriptionStatus) where.subscriptionStatus = query.subscriptionStatus;

    const orderBy = parseSort(query, ["startDate", "expiryDate", "createdAt"], "createdAt");

    try {
      const [items, total] = await Promise.all([
        prisma.companySubscription.findMany({
          where, skip, take: limit, orderBy, include: subscriptionInclude,
        }),
        prisma.companySubscription.count({ where }),
      ]);
      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findSubscriptionById(id) {
    try {
      return await prisma.companySubscription.findFirst({
        where: { id, deletedAt: null },
        include: subscriptionInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async createSubscription(data) {
    try {
      return await prisma.companySubscription.create({ data, include: subscriptionInclude });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateSubscription(id, data) {
    try {
      return await prisma.companySubscription.update({
        where: { id },
        data,
        include: subscriptionInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async softDeleteSubscription(id) {
    try {
      return await prisma.companySubscription.update({
        where: { id },
        data: { deletedAt: new Date(), subscriptionStatus: "CANCELLED" },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new SubscriptionRepository();
