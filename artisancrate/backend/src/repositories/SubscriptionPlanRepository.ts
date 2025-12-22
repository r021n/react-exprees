import { Repository, EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";

export class SubscriptionPlanRepository {
  private repo: Repository<SubscriptionPlan>;

  constructor(private manager?: EntityManager) {
    this.repo = manager
      ? manager.getRepository(SubscriptionPlan)
      : AppDataSource.getRepository(SubscriptionPlan);
  }

  findActiveWithItems() {
    return this.repo.find({
      where: { isActive: true },
      relations: { items: { product: true } },
      order: { price: "ASC" },
    });
  }

  findByIdWithItems(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: { items: { product: true } },
    });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async createAndSave(
    data: Partial<SubscriptionPlan>
  ): Promise<SubscriptionPlan> {
    const plan = this.repo.create(data);
    return this.repo.save(plan);
  }

  async save(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
    return this.repo.save(plan);
  }

  async delete(plan: SubscriptionPlan): Promise<void> {
    await this.repo.remove(plan);
  }
}
