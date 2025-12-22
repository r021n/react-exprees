import { z } from "zod";

const SUBSCRIPTION_STATUSES = [
  "pending_initial_payment",
  "active",
  "paused",
  "cancelled",
  "expired",
] as const;

const PaymentMethodTypeEnum = z.enum(
  ["manual_payment_link", "credit_card_token"] as const,
  {
    error: (iss) =>
      iss.input === undefined
        ? "payment_method_type wajib diisi"
        : "payment_method_type tidak valid",
  }
);

const SubscriptionStatusEnum = z.enum(SUBSCRIPTION_STATUSES, {
  error: "status tidak valid",
});

const positiveIntField = (fieldName: string) =>
  z
    .number({
      error: (iss) =>
        iss.code === "invalid_type" && iss.expected === "number"
          ? `${fieldName} harus angka`
          : undefined,
    })
    .int()
    .positive({ error: `${fieldName} harus > 0` });

export const createSubscriptionSchema = z.object({
  body: z.object({
    subscription_plan_id: positiveIntField("subscription_plan_id"),
    shipping_address_id: positiveIntField("shipping_address_id"),
    payment_method_type: PaymentMethodTypeEnum,
  }),
});

export const subscriptionIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { error: "ID harus berupa angka" }),
  }),
});

export const adminListSubscriptionsSchema = z.object({
  query: z.object({ status: SubscriptionStatusEnum.optional() }),
});

export const adminUpdateSubscriptionStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { error: "ID harus berupa angka" }),
  }),
  body: z.object({
    status: z.enum(SUBSCRIPTION_STATUSES, {
      error: (iss) =>
        iss.input === undefined ? "Status wajib diisi" : "Status tidak valid",
    }),
  }),
});
