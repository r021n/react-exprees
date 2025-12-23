import { Router } from "express";
import { SubscriptionController } from "../controllers/SubscriptionController";
import { authMiddleware } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createSubscriptionSchema,
  subscriptionIdParamSchema,
} from "../validators/subscriptionValidators";

const router = Router();

router.use(authMiddleware);

router.get("/", SubscriptionController.getMySubscriptions);
router.get(
  "/:id",
  validateRequest(subscriptionIdParamSchema),
  SubscriptionController.getMySubscriptionDetail
);

router.post(
  "/",
  validateRequest(createSubscriptionSchema),
  SubscriptionController.createSubscription
);
router.post(
  "/:id/cancel",
  validateRequest(subscriptionIdParamSchema),
  SubscriptionController.cancelMySubscription
);
router.post(
  "/:id/pause",
  validateRequest(subscriptionIdParamSchema),
  SubscriptionController.pauseMySubscription
);
router.post(
  "/:id/resume",
  validateRequest(subscriptionIdParamSchema),
  SubscriptionController.resumeMySubscription
);

export default router;
