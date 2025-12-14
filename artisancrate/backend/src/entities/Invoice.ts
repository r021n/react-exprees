import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { UserSubscription } from "./UserSubscription";

export type InvoiceStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "failed"
  | "expired";

@Entity("invoices")
@Index("idx_invoices_midtrans_order_id", ["midtransOrderId"])
export class Invoice extends BaseModel {
  @ManyToOne(() => UserSubscription, (subscription) => subscription.invoices, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_subscription_id" })
  userSubscription!: UserSubscription;

  @Column({ name: "user_subscription_id", type: "int" })
  userSubscriptionId!: number;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @Column({ name: "invoice_number", type: "varchar", length: 50, unique: true })
  invoiceNumber!: string;

  @Column({ type: "int" })
  amount!: number;

  @Column({ type: "varchar", length: 10, default: "IDR" })
  currency!: string;

  @Column({ name: "billing_period_start", type: "date", nullable: true })
  billingPeriodStart?: string | null;

  @Column({ name: "billing_period_end", type: "date", nullable: true })
  billingPeriodEnd?: string | null;

  @Column({ type: "varchar", length: 20 })
  status!: InvoiceStatus;

  @Column({ name: "due_date", type: "timestamptz", nullable: true })
  dueDate?: Date | null;

  @Column({
    name: "midtrans_order_id",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  midtransOrderId?: string | null;

  @Column({ name: "midtrans_payment_link", type: "text", nullable: true })
  midtransPaymentLink?: string | null;

  @Column({ name: "paid_at", type: "timestamptz", nullable: true })
  paidAt?: Date | null;
}
