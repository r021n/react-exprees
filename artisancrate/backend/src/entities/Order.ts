import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { UserSubscription } from "./UserSubscription";
import { Invoice } from "./Invoice";
import { UserAddress } from "./UserAddress";

export type OrderStatus =
  | "pending_fulfillment"
  | "being_prepared"
  | "shipped"
  | "delivered"
  | "cancelled";

@Entity("orders")
export class Order extends BaseModel {
  @ManyToOne(() => UserSubscription, (subscription) => subscription.orders, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_subscription_id" })
  userSubscription!: UserSubscription;

  @Column({ name: "user_subscription_id", type: "int" })
  userSubscriptionId!: number;

  @ManyToOne(() => Invoice, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_id" })
  invoice!: Invoice;

  @Column({ name: "invoice_id", type: "int" })
  invoiceId!: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @ManyToOne(() => UserAddress, (address) => address.orders, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "shipping_address_id" })
  shippingAddress!: UserAddress;

  @Column({ name: "shipping_address_id", type: "int" })
  shippingAddressId!: number;

  @Column({ type: "varchar", length: 30 })
  status!: OrderStatus;

  @Column({
    name: "shipping_courier",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  shippingCourier?: string | null;

  @Column({
    name: "tracking_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  trackingNumber?: string | null;

  @Column({ name: "shipping_date", type: "timestamptz", nullable: true })
  shippingDate?: Date | null;

  @Column({ name: "delivered_date", type: "timestamptz", nullable: true })
  deliveredDate?: Date | null;

  @Column({ type: "text", nullable: true })
  notes?: string | null;
}
