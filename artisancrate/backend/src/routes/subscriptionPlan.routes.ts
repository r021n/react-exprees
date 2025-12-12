import { Router } from "express";
import { SubscriptionPlanController } from "../controllers/SubscriptionPlanController";

const router = Router();

router.get("/", SubscriptionPlanController.getActivePlans);

export default router;
