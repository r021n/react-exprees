import { Request, Response, NextFunction } from "express";
import { InvoiceService } from "../services/InvoiceService";
import type { InvoiceStatus } from "../entities/Invoice";

const invoiceService = new InvoiceService();

export class AdminInvoiceController {
  static async getAllInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const statusParam = req.query.status as string | undefined;
      const status = statusParam as InvoiceStatus | undefined;

      const invoices = await invoiceService.getAllInvoices(status);
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const invoice = await invoiceService.getInvoiceDetailAdmin(id);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }
}
