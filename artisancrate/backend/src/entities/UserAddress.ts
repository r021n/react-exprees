import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from "typeorm";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { UserSubscription } from "./UserSubscription";
import { Order } from "./Order";

@Entity("user_addresses")
export class UserAddress extends BaseModel {
  @ManyToOne(() => User, (user) => user.addresses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  @Index()
  user!: User;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @Column({ type: "varchar", length: 100 })
  label!: string;

  @Column({ name: "recipient_name", type: "varchar", length: 100 })
  recipientName!: string;

  @Column({ name: "phone", type: "varchar", length: 20 })
  phone!: string;

  @Column({ name: "address_line1", type: "varchar", length: 255 })
  addressLine1!: string;

  @Column({
    name: "address_line2",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  addressLine2?: string | null;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ type: "varchar", length: 100 })
  province!: string;

  @Column({ name: "postal_code", type: "varchar", length: 20 })
  postalCode!: string;

  @Column({ type: "varchar", length: 100, default: "Indonesia" })
  country!: string;

  @Column({ name: "is_default", type: "boolean", default: false })
  isDefault!: boolean;

  @OneToMany(
    () => UserSubscription,
    (subscription) => subscription.shippingAddress
  )
  subscriptions!: UserSubscription[];

  @OneToMany(() => Order, (order) => order.shippingAddress)
  orders!: Order[];
}
