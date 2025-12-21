import { Repository, FindManyOptions } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Order, OrderStatus } from "../entities/Order";

export class OrderRepository {
  private repo: Repository<Order>;

  constructor() {
    this.repo = AppDataSource.getRepository(Order);
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByIdWithRelations(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: {
        userSubscription: { subscriptionPlan: true },
        invoice: true,
        shippingAddress: true,
        user: true,
      },
    });
  }

  findByIdAndUser(id: number, userId: number) {
    return this.repo.findOne({
      where: { id, userId },
      relations: {
        userSubscription: { subscriptionPlan: true },
        invoice: true,
        shippingAddress: true,
      },
    });
  }

  findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      relations: {
        userSubscription: { subscriptionPlan: true },
        invoice: true,
        shippingAddress: true,
      },
      order: { createdAt: "DESC" },
    });
  }

  findAllWithFilter(status?: OrderStatus) {
    const options: FindManyOptions<Order> = {
      relations: {
        userSubscription: { subscriptionPlan: true },
        invoice: true,
        shippingAddress: true,
        user: true,
      },
      order: { createdAt: "DESC" },
    };

    if (status) {
      options.where = { status };
    }

    return this.repo.find(options);
  }

  async save(order: Order): Promise<Order> {
    return this.repo.save(order);
  }
}
