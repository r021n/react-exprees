import { Repository, FindManyOptions } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Invoice, InvoiceStatus } from "../entities/Invoice";

export class InvoiceRepository {
  private repo: Repository<Invoice>;

  constructor() {
    this.repo = AppDataSource.getRepository(Invoice);
  }

  findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: { userSubscription: { subscriptionPlan: true } },
    });
  }

  findByIdAndUser(id: number, userId: number) {
    return this.repo.findOne({
      where: { id, userId },
      relations: { userSubscription: { subscriptionPlan: true } },
    });
  }

  findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      relations: { userSubscription: { subscriptionPlan: true } },
      order: { createdAt: "DESC" },
    });
  }

  findAllWithFilter(status?: InvoiceStatus) {
    const options: FindManyOptions<Invoice> = {
      relations: {
        userSubscription: { subscriptionPlan: true },
        user: true,
      },
      order: { createdAt: "DESC" },
    };

    if (status) {
      options.where = { status };
    }

    return this.repo.find(options);
  }

  async createAndSave(data: Partial<Invoice>): Promise<Invoice> {
    const inv = this.repo.create(data);
    return this.repo.save(inv);
  }

  async save(inv: Invoice): Promise<Invoice> {
    return this.repo.save(inv);
  }
}
