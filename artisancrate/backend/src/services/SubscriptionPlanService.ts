import { SubscriptionPlanRepository } from "../repositories/SubscriptionPlanRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { AppError } from "../core/AppError";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";
import { SubscriptionPlanItem } from "../entities/SubscriptionPlanItem";
import { AppDataSource } from "../config/data-source";

interface PlanItemInput {
  productId: number;
  quantity: number;
}

interface PlanInput {
  name: string;
  description?: string;
  billingPeriod: "weekly" | "monthly";
  billingInterval: number;
  price: number;
  currency: string;
  isActive?: boolean;
  items: PlanItemInput[];
}

export class SubscriptionPlanService {
  private planRepo: SubscriptionPlanRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.planRepo = new SubscriptionPlanRepository();
    this.productRepo = new ProductRepository();
  }

  getActivePlansWithItems() {
    return this.planRepo.findActiveWithItems();
  }

  async createPlan(input: PlanInput) {
    const products = await Promise.all(
      input.items.map((i) => this.productRepo.findById(i.productId))
    );

    products.forEach((p, idx) => {
      if (!p) {
        throw new AppError(
          `Product dengan ID ${input.items[idx]?.productId} tidak ditemukan`,
          400,
          "PRODUCT_NOT_FOUND"
        );
      }
    });

    return AppDataSource.transaction(async (manager) => {
      const planRepo = new SubscriptionPlanRepository(manager);

      const plan = manager.create(SubscriptionPlan, {
        name: input.name,
        description: input.description ?? null,
        billingPeriod: input.billingPeriod,
        billingInterval: input.billingInterval,
        price: input.price,
        currency: input.currency,
        isActive: input.isActive ?? true,
      });

      await manager.save(plan);

      const items: SubscriptionPlanItem[] = input.items.map((i, idx) => {
        return manager.create(SubscriptionPlanItem, {
          subscriptionPlanId: plan.id,
          productId: products[idx]!.id,
          quantity: i.quantity,
        });
      });

      await manager.save(items);

      return planRepo.findByIdWithItems(plan.id);
    });
  }

  async updatePlan(planId: number, input: Partial<PlanInput>) {
    const plan = await this.planRepo.findByIdWithItems(planId);
    if (!plan) {
      throw new AppError(
        "Paket langganan tidak ditemukan",
        404,
        "PLAN_NOT_FOUND"
      );
    }

    return AppDataSource.transaction(async (manager) => {
      if (input.name !== undefined) plan.name = input.name;
      if (input.description !== undefined) plan.description = input.description;
      if (input.billingPeriod !== undefined)
        plan.billingPeriod = input.billingPeriod;
      if (input.billingInterval !== undefined)
        plan.billingInterval = input.billingInterval;
      if (input.price !== undefined) plan.price = input.price;
      if (input.currency !== undefined) plan.currency = input.currency;
      if (input.isActive !== undefined) plan.isActive = input.isActive;

      await manager.save(plan);

      const planRepo = new SubscriptionPlanRepository(manager);

      if (input.items) {
        await manager.delete(SubscriptionPlanItem, {
          subscriptionPlanId: plan.id,
        });

        const products = await Promise.all(
          input.items.map((i) => this.productRepo.findById(i.productId))
        );
        products.forEach((p, idx) => {
          if (!p) {
            throw new AppError(
              `Product dengan ID ${
                input.items![idx]?.productId
              } tidak ditemukan`,
              404,
              "PRODUCT_NOT_FOUND"
            );
          }
        });

        const items = input.items.map((i, idx) =>
          manager.create(SubscriptionPlanItem, {
            subscriptionPlanId: plan.id,
            productId: products[idx]!.id,
            quantity: i.quantity,
          })
        );

        await manager.save(items);
      }

      return planRepo.findByIdWithItems(plan.id);
    });
  }

  async deletePlan(planId: number) {
    const plan = await this.planRepo.findByid(planId);
    if (!plan) {
      throw new AppError(
        "Paker langganan tidak ditemukan",
        404,
        "PLAN_NOT_FOUND"
      );
    }

    await this.planRepo.delete(plan);
  }
}
