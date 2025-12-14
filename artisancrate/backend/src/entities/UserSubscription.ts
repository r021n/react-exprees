import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { SubscriptionPlan, BillingPeriod } from "./SubscriptionPlan";
import { UserAddress } from "./UserAddress";
import { Invoice } from "./Invoice";
import { Order } from "./Order";

export type UserSubscriptionStatus =
  | "pending_initial_payment"
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export type PaymentMethodType = "manual_payment_link" | "credit_card_token";

@Entity("user_subscriptions")
@Index("idx_user_subscriptions_next_billing_date", ["nextBillingDate"])
export class UserSubscription extends BaseModel {
  @ManyToOne(() => User, (user) => user.subscriptions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "subscription_plan_id" })
  subscriptionPlan!: SubscriptionPlan;

  @Column({ name: "subscription_plan_id", type: "int" })
  subscriptionPlanId!: number;

  @ManyToOne(() => UserAddress, (address) => address.subscriptions, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "shipping_address_id" })
  shippingAddress!: UserAddress;

  @Column({ name: "shipping_address_id", type: "int" })
  shippingAddressId!: number;

  @Column({ name: "start_date", type: "timestamptz" })
  startDate!: Date;

  @Column({ name: "next_billing_date", type: "date" })
  nextBillingDate!: string;

  @Column({ name: "billing_period", type: "varchar", length: 20 })
  billingPeriod!: BillingPeriod;

  @Column({ name: "billing_interval", type: "int", default: 1 })
  billingInterval!: number;

  @Column({ type: "varchar", length: 30 })
  status!: UserSubscriptionStatus;

  @Column({ name: "payment_method_type", type: "varchar", length: 50 })
  paymentMethodType!: PaymentMethodType;

  @Column({
    name: "payment_method_token",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  paymentMethodToken?: string | null;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({ name: "cancelled_at", type: "timestamptz", nullable: true })
  cancelledAt?: Date | null;

  @Column({ name: "paused_at", type: "timestamptz", nullable: true })
  pausedAt?: Date | null;

  @OneToMany(() => Invoice, (invoice) => invoice.userSubscription)
  invoices!: Invoice[];

  @OneToMany(() => Order, (order) => order.userSubscription)
  orders!: Order[];
}
