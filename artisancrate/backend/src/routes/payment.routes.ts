import { Router } from "express";
import { PaymentController } from "../controllers/paymentController";

const router = Router();

router.post("/midtrans/webhook", PaymentController.midtransWebhook);

export default router;
