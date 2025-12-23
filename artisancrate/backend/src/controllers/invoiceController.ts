import { Request, Response, NextFunction } from "express";
import { InvoiceRepository } from "../repositories/InvoiceRepository";
import { PaymentService } from "../services/PaymentService";
import { InvoiceService } from "../services/InvoiceService";
import { AppError } from "../core/AppError";

const invoiceRepo = new InvoiceRepository();
const paymentService = new PaymentService();
const invoiceService = new InvoiceService();

export class InvoiceController {
  static async getMyInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const invoices = await invoiceService.getUserInvoices(req.user.id);
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  static async getMyInvoiceDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw new AppError("ID tidak valid", 400, "INVALID_ID");
      }

      const invoice = await invoiceService.getUserInvoiceDetail(
        req.user.id,
        id
      );
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async payInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw new AppError("ID invoice tidak valid", 400, "INVALID_ID");
      }

      const invoice = await invoiceRepo.findById(id);
      if (!invoice || invoice.userId !== req.user.id) {
        throw new AppError("Invoice tidak ditemukan", 404, "INVOICE_NOT_FOUND");
      }

      if (invoice.status === "paid") {
        throw new AppError(
          "Invoice sudah dibayar",
          400,
          "INVOICE_ALREADY_PAID"
        );
      }

      if (invoice.status === "cancelled") {
        throw new AppError("Invoice dibatalkan", 400, "INVOICE_CANCELLED");
      }

      const updated = await paymentService.createSnapTransactionForInvoice(
        invoice.id
      );

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}
