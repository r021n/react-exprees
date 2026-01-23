import type { SubscriptionPlan } from "./subscription";
import type { UserAddress } from "./address";

export type InvoiceStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "failed"
  | "expired";

export interface Invoice {
  id: number;
  userSubscriptionId: number;
  userId: number;
  invoiceNumber: string;
  amount: number;
  currency: string;
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
  status: InvoiceStatus;
  dueDate?: string | null;
  midtransOrderId?: string | null;
  midtransPaymentLink?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userSubscription?: {
    id: number;
    subscriptionPlan?: SubscriptionPlan;
    shippingAddress?: UserAddress;
  };
}
