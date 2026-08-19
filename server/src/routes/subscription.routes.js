import { Router } from "express";
import SubscriptionController from "../controllers/SubscriptionController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  planCreateSchema,
  planUpdateSchema,
  planQuerySchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
  subscriptionQuerySchema,
  idParamSchema,
} from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription plan & company subscription management
 */

// Plans
router.get("/plans", validate(planQuerySchema, "query"), SubscriptionController.getAllPlans);
router.get("/plans/:id", validate(idParamSchema, "params"), SubscriptionController.getPlanById);
router.post(
  "/plans",
  authorize(ROLES.SUPER_ADMIN),
  validate(planCreateSchema),
  SubscriptionController.createPlan
);
router.patch(
  "/plans/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate(idParamSchema, "params"),
  validate(planUpdateSchema),
  SubscriptionController.updatePlan
);
router.delete(
  "/plans/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate(idParamSchema, "params"),
  SubscriptionController.removePlan
);

// Company Subscriptions
router.get(
  "/company-subscriptions",
  validate(subscriptionQuerySchema, "query"),
  SubscriptionController.getAllSubscriptions
);
router.get("/company-subscriptions/:subscriptionId", SubscriptionController.getSubscriptionById);
router.post(
  "/company-subscriptions",
  authorize(ROLES.SUPER_ADMIN),
  validate(subscriptionCreateSchema),
  SubscriptionController.createSubscription
);
router.patch(
  "/company-subscriptions/:subscriptionId",
  authorize(ROLES.SUPER_ADMIN),
  validate(subscriptionUpdateSchema),
  SubscriptionController.updateSubscription
);
router.delete(
  "/company-subscriptions/:subscriptionId",
  authorize(ROLES.SUPER_ADMIN),
  SubscriptionController.removeSubscription
);

export default router;
