import { Router } from "express";
import { AdminSubscriptionController } from "../controllers/AdminSubscriptionController";
import { authMiddleware } from "../middlewares/auth";
import { adminOnly } from "../middlewares/adminOnly";
import { validateRequest } from "../middlewares/validateRequest";
import {
  adminListSubscriptionsSchema,
  adminUpdateSubscriptionStatusSchema,
} from "../validators/subscriptionValidators";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get(
  "/",
  validateRequest(adminListSubscriptionsSchema),
  AdminSubscriptionController.getAllSubscriptions
);
router.get("/:id", AdminSubscriptionController.getSubscriptionDetail);
router.put(
  "/:id/status",
  validateRequest(adminUpdateSubscriptionStatusSchema),
  AdminSubscriptionController.updateSubscriptionStatus
);

export default router;
