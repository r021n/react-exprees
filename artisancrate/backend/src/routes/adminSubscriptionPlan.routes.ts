import { Router } from "express";
import { SubscriptionPlanController } from "../controllers/SubscriptionPlanController";
import { authMiddleware } from "../middlewares/auth";
import { adminOnly } from "../middlewares/adminOnly";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createPlanSchema,
  updatePlanSchema,
} from "../validators/subscriptionPlanValidators";

const router = Router();

router.use(authMiddleware, adminOnly);

router.post(
  "/",
  validateRequest(createPlanSchema),
  SubscriptionPlanController.createPlan
);
router.put(
  "/:id",
  validateRequest(updatePlanSchema),
  SubscriptionPlanController.updatePlan
);
router.delete("/:id", SubscriptionPlanController.deletePlan);

export default router;
