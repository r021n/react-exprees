import { Entity, Column, OneToMany, Index } from "typeorm";
import { BaseModel } from "./BaseModel";
import { SubscriptionPlanItem } from "./SubscriptionPlanItem";

export type ProductType = "coffee" | "tea";

@Entity("products")
export class Product extends BaseModel {
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 50 })
  type!: ProductType;

  @Column({ type: "varchar", length: 100, nullable: true })
  variant?: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  @Index("idx_products_is_active")
  isActive!: boolean;

  @OneToMany(() => SubscriptionPlanItem, (planItem) => planItem.product)
  planItems!: SubscriptionPlanItem[];
}
