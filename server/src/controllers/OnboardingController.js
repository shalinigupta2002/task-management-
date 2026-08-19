import OnboardingService from "../services/OnboardingService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class OnboardingController {
  listPlans = asyncHandler(async (_req, res) => {
    const plans = await OnboardingService.listPublicPlans();
    return ApiResponse.success(res, plans);
  });

  createCheckout = asyncHandler(async (req, res) => {
    const result = await OnboardingService.createCheckout(req.validatedBody || req.body);
    return ApiResponse.created(res, result, "Checkout created");
  });

  getSession = asyncHandler(async (req, res) => {
    const { referenceCode, sessionToken } = req.validatedQuery || req.query;
    const result = await OnboardingService.getBySession(referenceCode, sessionToken);
    return ApiResponse.success(res, result);
  });

  verifyPayment = asyncHandler(async (req, res) => {
    const result = await OnboardingService.verifyPayment(req.validatedBody || req.body);
    return ApiResponse.success(res, result, "Payment verified");
  });

  simulatePayment = asyncHandler(async (req, res) => {
    const result = await OnboardingService.simulatePaymentSuccess(req.validatedBody || req.body);
    return ApiResponse.success(res, result, "Payment simulated");
  });

  failPayment = asyncHandler(async (req, res) => {
    const result = await OnboardingService.markPaymentFailed(req.validatedBody || req.body);
    return ApiResponse.success(res, result, "Payment marked failed");
  });

  complete = asyncHandler(async (req, res) => {
    const result = await OnboardingService.completeOnboarding(req.validatedBody || req.body);
    return ApiResponse.created(res, result, "Company onboarding completed");
  });
}

export default new OnboardingController();
