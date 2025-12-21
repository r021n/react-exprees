import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import meRoutes from "./me.routes";
import productRoutes from "./product.routes";
import subscriptionPlanRoutes from "./subscriptionPlan.routes";
import adminSubsmissionPlanRoutes from "./adminSubscriptionPlan.routes";
import subscriptionRoutes from "./subscription.routes";
import invoiceRoutes from "./invoice.routes";
import paymentRoutes from "./payment.routes";
import orderRoutes from "./order.routes";
import adminOrdersRoutes from "./adminOrders.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/me", meRoutes);
router.use("/products", productRoutes);
router.use("/subscription-plans", subscriptionPlanRoutes);
router.use("/admin/subscription-plans", adminSubsmissionPlanRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/payment", paymentRoutes);
router.use("/orders", orderRoutes);
router.use("/admin/orders", adminOrdersRoutes);

export default router;
