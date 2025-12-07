import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseModel } from "./BaseModel";
import { SubscriptionPlan } from "./SubscriptionPlan";
import { Product } from "./Product";

@Entity("subscription_plan_items")
@Index(["subscriptionPlanId", "productId"], { unique: true })
export class SubscriptionPlanItem extends BaseModel {
  @ManyToOne(() => SubscriptionPlan, (plan) => plan.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "subscription_plan_id" })
  subscriptionPlan!: SubscriptionPlan;

  @Column({ name: "subscription_plan_id", type: "int" })
  subscriptionPlanId!: number;

  @ManyToOne(() => Product, (product) => product.planItems, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ name: "product_id", type: "int" })
  productId!: number;

  @Column({ type: "int", default: 1 })
  quantity!: number;
}
