import type { Product } from "./product";
import type { UserAddress } from "./address";
import type { Invoice } from "./invoice";
import type { Order } from "./order";

export type BillingPeriod = "weekly" | "monthly";

export interface SubscriptionPlanItem {
  id: number;
  subscriptionPlanId: number;
  productId: number;
  quantity: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string | null;
  billingPeriod: BillingPeriod;
  billingInterval: number;
  price: number;
  currency: string;
  isActive: boolean;
  items: SubscriptionPlanItem[];
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | "pending_initial_payment"
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export type PaymentMethodType = "manual_payment_link" | "credit_card_token";

export interface UserSubscription {
  id: number;
  userId: number;
  subscriptionPlanId: number;
  shippingAddressId: number;
  startDate: string;
  nextBillingDate: string;
  billingPeriod: BillingPeriod;
  billingInterval: number;
  status: SubscriptionStatus;
  paymentMethodType: PaymentMethodType;
  paymentMethodToken?: string | null;
  notes?: string | null;
  cancelledAt?: string | null;
  pausedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  subscriptionPlan?: SubscriptionPlan;
  shippingAddress?: UserAddress;
  invoices?: Invoice[];
  orders?: Order[];
}
