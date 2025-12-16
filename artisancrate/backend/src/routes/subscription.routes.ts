import { Router } from "express";
import { SubscriptionController } from "../controllers/SubscriptionController";
import { authMiddleware } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { createSubscriptionSchema } from "../validators/subscriptionValidators";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createSubscriptionSchema),
  SubscriptionController.createSubscription
);

export default router;
