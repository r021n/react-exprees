import { Entity, Column, OneToMany, Unique } from "typeorm";
import { BaseModel } from "./BaseModel";
import { UserAddress } from "./UserAddress";
import { UserSubscription } from "./UserSubscription";
import { Invoice } from "./Invoice";
import { Order } from "./Order";

export type UserRole = "user" | "admin";

@Entity("users")
@Unique(["email"])
export class User extends BaseModel {
  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: "varchar", length: 20, default: "user" })
  role!: UserRole;

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses!: UserAddress[];

  @OneToMany(() => UserSubscription, (subscription) => subscription.user)
  subscriptions!: UserSubscription[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices!: Invoice[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];
}
