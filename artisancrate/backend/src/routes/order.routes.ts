import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", OrderController.getMyOrders);
router.get("/:id", OrderController.getMyOrderDetail);

export default router;
