import SubscriptionService from "../services/SubscriptionService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class SubscriptionController {
  // Plans
  getAllPlans = asyncHandler(async (req, res) => {
    const result = await SubscriptionService.getAllPlans(req.validatedQuery || req.query);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getPlanById = asyncHandler(async (req, res) => {
    const plan = await SubscriptionService.getPlanById(req.validatedParams?.id || req.params.id);
    return ApiResponse.success(res, plan);
  });

  createPlan = asyncHandler(async (req, res) => {
    const plan = await SubscriptionService.createPlan(req.validatedBody || req.body);
    return ApiResponse.created(res, plan, "Subscription plan created successfully");
  });

  updatePlan = asyncHandler(async (req, res) => {
    const plan = await SubscriptionService.updatePlan(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body
    );
    return ApiResponse.success(res, plan, "Subscription plan updated successfully");
  });

  removePlan = asyncHandler(async (req, res) => {
    await SubscriptionService.removePlan(req.validatedParams?.id || req.params.id);
    return ApiResponse.success(res, null, "Subscription plan deleted successfully");
  });

  // Company Subscriptions
  getAllSubscriptions = asyncHandler(async (req, res) => {
    const result = await SubscriptionService.getAllSubscriptions(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getSubscriptionById = asyncHandler(async (req, res) => {
    const sub = await SubscriptionService.getSubscriptionById(req.params.subscriptionId, req.user);
    return ApiResponse.success(res, sub);
  });

  createSubscription = asyncHandler(async (req, res) => {
    const sub = await SubscriptionService.createSubscription(req.validatedBody || req.body);
    return ApiResponse.created(res, sub, "Company subscription created successfully");
  });

  updateSubscription = asyncHandler(async (req, res) => {
    const sub = await SubscriptionService.updateSubscription(
      req.params.subscriptionId,
      req.validatedBody || req.body
    );
    return ApiResponse.success(res, sub, "Company subscription updated successfully");
  });

  removeSubscription = asyncHandler(async (req, res) => {
    await SubscriptionService.removeSubscription(req.params.subscriptionId);
    return ApiResponse.success(res, null, "Company subscription deleted successfully");
  });
}

export default new SubscriptionController();
