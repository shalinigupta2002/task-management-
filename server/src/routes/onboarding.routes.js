import { Router } from "express";
import OnboardingController from "../controllers/OnboardingController.js";
import validate from "../middlewares/validate.middleware.js";
import {
  onboardingCheckoutSchema,
  onboardingSessionQuerySchema,
  onboardingPaymentVerifySchema,
  onboardingSessionBodySchema,
  onboardingCompleteSchema,
} from "../validators/onboarding.validators.js";

const router = Router();

/**
 * Public self-service company onboarding + checkout.
 * No JWT required — secured by onboarding session token.
 */
router.get("/plans", OnboardingController.listPlans);
router.post("/checkout", validate(onboardingCheckoutSchema), OnboardingController.createCheckout);
router.get("/session", validate(onboardingSessionQuerySchema, "query"), OnboardingController.getSession);
router.post("/payment/verify", validate(onboardingPaymentVerifySchema), OnboardingController.verifyPayment);
router.post("/payment/simulate", validate(onboardingSessionBodySchema), OnboardingController.simulatePayment);
router.post("/payment/fail", validate(onboardingSessionBodySchema), OnboardingController.failPayment);
router.post("/complete", validate(onboardingCompleteSchema), OnboardingController.complete);

export default router;
