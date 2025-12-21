import { Router } from "express";
import { AdminOrderController } from "../controllers/AdminOrderController";
import { authMiddleware } from "../middlewares/auth";
import { adminOnly } from "../middlewares/adminOnly";
import { validateRequest } from "../middlewares/validateRequest";
import {
  adminListOrdersSchema,
  updateOrderStatusSchema,
} from "../validators/orderValidators";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get(
  "/",
  validateRequest(adminListOrdersSchema),
  AdminOrderController.getAllOrders
);
router.put(
  "/:id/status",
  validateRequest(updateOrderStatusSchema),
  AdminOrderController.updateOrderStatus
);

export default router;
