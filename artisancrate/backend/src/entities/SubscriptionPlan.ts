import { Entity, Column, OneToMany, Index } from "typeorm";
import { BaseModel } from "./BaseModel";
import { SubscriptionPlanItem } from "./SubscriptionPlanItem";

export type BillingPeriod = "weekly" | "monthly";

@Entity("subscription_plans")
export class SubscriptionPlan extends BaseModel {
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ name: "billing_period", type: "varchar", length: 20 })
  billingPeriod!: BillingPeriod;

  @Column({ name: "billing_interval", type: "int", default: 1 })
  billingInterval!: number;

  @Column({ type: "int" })
  price!: number;

  @Column({ type: "varchar", length: 10, default: "IDR" })
  currency!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  @Index("idx_subscription_plans_is_active")
  isActive!: boolean;

  @OneToMany(() => SubscriptionPlanItem, (item) => item.subscriptionPlan)
  items!: SubscriptionPlanItem[];
}
