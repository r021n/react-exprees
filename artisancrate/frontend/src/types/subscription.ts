import type { Product } from "./product";

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
