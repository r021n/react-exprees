import { z } from "zod";

const ORDER_STATUS = [
  "pending_fulfillment",
  "being_prepared",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const orderStatusOptional = z.enum(ORDER_STATUS, {
  error: "status tidak valid",
});

const orderStatusRequired = z.enum(ORDER_STATUS, {
  error: (issue) =>
    issue.input === undefined ? "status wajib diisi" : "status tidak valid",
});

export const adminListOrdersSchema = z.object({
  query: z.object({ status: orderStatusOptional.optional() }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { error: "ID order harus berupa angka" }),
  }),
  body: z.object({
    status: orderStatusRequired,
    shippingCourier: z.string().optional(),
    trackingNumber: z.string().optional(),
  }),
});
