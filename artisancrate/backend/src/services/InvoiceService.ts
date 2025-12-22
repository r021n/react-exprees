import { InvoiceRepository } from "../repositories/InvoiceRepository";
import { AppError } from "../core/AppError";
import type { InvoiceStatus } from "../entities/Invoice";

export class InvoiceService {
  private invoiceRepo: InvoiceRepository;

  constructor() {
    this.invoiceRepo = new InvoiceRepository();
  }

  getUserInvoices(userId: number) {
    return this.invoiceRepo.findByUser(userId);
  }

  async getUserInvoiceDetail(userId: number, id: number) {
    const invoice = await this.invoiceRepo.findByIdAndUser(id, userId);
    if (!invoice) {
      throw new AppError("Invoice tidak ditemukan", 404, "INVOICE_NOT_FOUND");
    }
    return invoice;
  }

  getAllInvoices(status?: InvoiceStatus) {
    return this.invoiceRepo.findAllWithFilter(status);
  }

  async getInvoiceDetailAdmin(id: number) {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) {
      throw new AppError("Invoice tidak ditemukan", 404, "INVOICE_NOT_FOUND");
    }
    return invoice;
  }
}
