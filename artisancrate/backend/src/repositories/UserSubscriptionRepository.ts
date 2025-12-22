import { Repository, FindManyOptions } from "typeorm";
import { AppDataSource } from "../config/data-source";
import {
  UserSubscription,
  UserSubscriptionStatus,
} from "../entities/UserSubscription";

export class UserSubscriptionRepository {
  private repo: Repository<UserSubscription>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserSubscription);
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByIdWithRelations(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: {
        subscriptionPlan: true,
        shippingAddress: true,
        invoices: true,
        orders: true,
      },
      order: {
        invoices: { createdAt: "DESC" },
        orders: { createdAt: "DESC" },
      },
    });
  }

  findByIdAndUser(id: number, userId: number) {
    return this.repo.findOne({
      where: { id, userId },
      relations: {
        subscriptionPlan: true,
        shippingAddress: true,
        invoices: true,
        orders: true,
      },
      order: {
        invoices: { createdAt: "DESC" },
        orders: { createdAt: "DESC" },
      },
    });
  }

  findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      relations: {
        subscriptionPlan: true,
        shippingAddress: true,
      },
      order: { createdAt: "DESC" },
    });
  }

  findAllWithFilter(status?: UserSubscriptionStatus) {
    const options: FindManyOptions<UserSubscription> = {
      relations: { user: true, subscriptionPlan: true, shippingAddress: true },
      order: { createdAt: "DESC" },
    };

    if (status) {
      options.where = { status };
    }

    return this.repo.find(options);
  }

  async createAndSave(
    data: Partial<UserSubscription>
  ): Promise<UserSubscription> {
    const sub = this.repo.create(data);
    return this.repo.save(sub);
  }

  async save(sub: UserSubscription): Promise<UserSubscription> {
    return this.repo.save(sub);
  }
}
