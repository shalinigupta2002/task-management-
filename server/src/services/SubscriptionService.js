import SubscriptionRepository from "../repositories/SubscriptionRepository.js";
import CompanyRepository from "../repositories/CompanyRepository.js";
import ApiError from "../utils/ApiError.js";
import { assertResourceAccess, loadUserContext } from "../utils/taskAccess.js";

class SubscriptionService {
  // ── Plans ──

  async getAllPlans(query) {
    return SubscriptionRepository.findAllPlans(query);
  }

  async getPlanById(id) {
    const plan = await SubscriptionRepository.findPlanById(id);
    if (!plan) throw ApiError.notFound("Subscription plan not found");
    return plan;
  }

  async createPlan(data) {
    const existing = await SubscriptionRepository.findPlanByName(data.planName);
    if (existing) throw ApiError.conflict("Plan name already exists");

    return SubscriptionRepository.createPlan({
      ...data,
      features: data.features || [],
    });
  }

  async updatePlan(id, data) {
    await this.getPlanById(id);

    if (data.planName) {
      const existing = await SubscriptionRepository.findPlanByName(data.planName);
      if (existing && existing.id !== id) throw ApiError.conflict("Plan name already exists");
    }

    return SubscriptionRepository.updatePlan(id, data);
  }

  async removePlan(id) {
    await this.getPlanById(id);
    return SubscriptionRepository.softDeletePlan(id);
  }

  // ── Company Subscriptions ──

  async getAllSubscriptions(query, userContext) {
    const q = { ...query };
    if (userContext.role !== "SUPER_ADMIN") {
      q.companyId = userContext.companyId;
    }
    return SubscriptionRepository.findAllSubscriptions(q);
  }

  async getSubscriptionById(id, userContext) {
    const sub = await SubscriptionRepository.findSubscriptionById(id);
    if (!sub) throw ApiError.notFound("Company subscription not found");

    const ctx = await loadUserContext(userContext.userId);
    assertResourceAccess(ctx, sub);

    return sub;
  }

  async createSubscription(data) {
    const company = await CompanyRepository.findById(data.companyId);
    if (!company) throw ApiError.badRequest("Company not found");

    const plan = await SubscriptionRepository.findPlanById(data.subscriptionPlanId);
    if (!plan) throw ApiError.badRequest("Subscription plan not found");

    return SubscriptionRepository.createSubscription(data);
  }

  async updateSubscription(id, data) {
    const sub = await SubscriptionRepository.findSubscriptionById(id);
    if (!sub) throw ApiError.notFound("Company subscription not found");

    if (data.subscriptionPlanId) {
      const plan = await SubscriptionRepository.findPlanById(data.subscriptionPlanId);
      if (!plan) throw ApiError.badRequest("Subscription plan not found");
    }

    return SubscriptionRepository.updateSubscription(id, data);
  }

  async removeSubscription(id) {
    const sub = await SubscriptionRepository.findSubscriptionById(id);
    if (!sub) throw ApiError.notFound("Company subscription not found");
    return SubscriptionRepository.softDeleteSubscription(id);
  }
}

export default new SubscriptionService();
