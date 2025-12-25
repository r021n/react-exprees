import type { UserAddress } from "./address";
import type { SubscriptionPlan } from "./subscription";
import type { Invoice } from "./invoice";

export type OrderStatus =
  | "pending_fulfillment"
  | "being_prepared"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  userSubscriptionId: number;
  invoiceId: number;
  userId: number;
  shippingAddressId: number;
  status: OrderStatus;
  shippingCourier?: string | null;
  trackingNumber?: string | null;
  shippingDate?: string | null;
  deliveredDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  userSubscription?: {
    id: number;
    subscriptionPlan?: SubscriptionPlan;
  };
  invoice?: Invoice;
  shippingAddress?: UserAddress;
}
