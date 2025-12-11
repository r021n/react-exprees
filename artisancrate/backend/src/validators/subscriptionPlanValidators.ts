import { z } from "zod";

const planItemSchema = z.object({
  productId: z.number().int().positive("productId harus angka positif"),
  quantity: z.number().int().positive("quantity minimal 1"),
});

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    description: z.string().optional(),
    billingPeriod: z
      .enum(["weekly", "monthly"])
      .refine((val) => !val, { message: "billingPeriod wajib diisi" }),
    billingInterval: z
      .number()
      .int()
      .positive("billingInterval minimal 1")
      .default(1),
    price: z.number().int().nonnegative("price tidak boleh negative"),
    currency: z.string().min(1).default("IDR"),
    isActive: z.boolean().optional(),
    items: z.array(planItemSchema).min(1, "Minimal 1 item produk"),
  }),
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID harus berupa angka"),
  }),
  body: createPlanSchema.shape.body.partial(),
});
