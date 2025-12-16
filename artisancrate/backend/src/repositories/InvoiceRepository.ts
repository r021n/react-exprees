import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Invoice } from "../entities/Invoice";

export class InvoiceRepository {
  private repo: Repository<Invoice>;

  constructor() {
    this.repo = AppDataSource.getRepository(Invoice);
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async createAndSave(data: Partial<Invoice>): Promise<Invoice> {
    const inv = this.repo.create(data);
    return this.repo.save(inv);
  }

  async save(inv: Invoice): Promise<Invoice> {
    return this.repo.save(inv);
  }
}
