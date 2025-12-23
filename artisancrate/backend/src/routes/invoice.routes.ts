import { Router } from "express";
import { InvoiceController } from "../controllers/invoiceController";
import { authMiddleware } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import {
  payInvoiceSchema,
  invoiceIdParamSchema,
} from "../validators/invoiceValidators";

const router = Router();

router.use(authMiddleware);

router.get("/", InvoiceController.getMyInvoices);
router.get(
  "/:id",
  validateRequest(invoiceIdParamSchema),
  InvoiceController.getMyInvoiceDetail
);

router.post(
  "/:id/pay",
  validateRequest(payInvoiceSchema),
  InvoiceController.payInvoice
);

export default router;
