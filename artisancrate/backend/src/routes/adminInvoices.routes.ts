import { Router } from "express";
import { AdminInvoiceController } from "../controllers/AdminInvoiceController";
import { authMiddleware } from "../middlewares/auth";
import { adminOnly } from "../middlewares/adminOnly";
import { validateRequest } from "../middlewares/validateRequest";
import {
  adminListInvoicesSchema,
  invoiceIdParamSchema,
} from "../validators/invoiceValidators";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get(
  "/",
  validateRequest(adminListInvoicesSchema),
  AdminInvoiceController.getAllInvoices
);

router.get(
  "/:id",
  validateRequest(invoiceIdParamSchema),
  AdminInvoiceController.getInvoiceDetail
);

export default router;
