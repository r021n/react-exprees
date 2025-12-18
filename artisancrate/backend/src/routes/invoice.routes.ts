import { Router } from "express";
import { InvoiceController } from "../controllers/invoiceController";
import { authMiddleware } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { payInvoiceSchema } from "../validators/invoiceValidators";

const router = Router();

router.post(
  "/:id/pay",
  authMiddleware,
  validateRequest(payInvoiceSchema),
  InvoiceController.payInvoice
);

export default router;
