import { z } from "zod";

export const createSubscriptionSchema = z.object({
  body: z.object({
    subscription_plan_id: z
      .number({
        error: (iss) =>
          iss.input === undefined
            ? "subscription_plan_id wajib diisi"
            : "subscription_plan_id harus angka",
      })
      .int()
      .positive("subscription_plan_id harus > 0"),
  }),
  shipping_address_id: z
    .number({
      error: (iss) =>
        iss.input === undefined
          ? "shipping_address_id wajib diisi"
          : "shipping_address_id harus angka",
    })
    .int()
    .positive("shipping_address_id harus > 0"),
  payment_method_type: z.enum(["manual_payment_link", "credit_card_token"], {
    error: (iss) =>
      iss.input === undefined
        ? "payment_method_type wajib diisi"
        : "payment_method_type haru salah satu: 'manual_payment_link' | 'credit_card_token'",
  }),
});
