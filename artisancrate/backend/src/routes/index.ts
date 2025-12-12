import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import meRoutes from "./me.routes";
import productRoutes from "./product.routes";
import subscriptionPlanRoutes from "./subscriptionPlan.routes";
import adminSubsmissionPlanRoutes from "./adminSubscriptionPlan.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/me", meRoutes);
router.use("/products", productRoutes);
router.use("/subscription-plans", subscriptionPlanRoutes);
router.use("/admin/subscription-plans", adminSubsmissionPlanRoutes);

export default router;
